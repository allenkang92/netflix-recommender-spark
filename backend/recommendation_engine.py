from pyspark.sql import SparkSession
from pyspark.ml.feature import CountVectorizer
from pyspark.ml.linalg import Vectors
from pyspark.sql.functions import udf, col, split, expr
from pyspark.sql.types import FloatType, ArrayType, StringType
from kafka import KafkaProducer
import json
import psycopg2
from psycopg2.extras import execute_values

# Spark 세션 초기화
def init_spark():
    return SparkSession.builder.appName("NetflixRecommendation").getOrCreate()

# PostgreSQL에서 영화 데이터 로드
def load_movie_data(spark, db_params):
    # JDBC를 통해 PostgreSQL에서 데이터 로드
    movies_df = spark.read.format("jdbc").option("url", f"jdbc:postgresql://{db_params['host']}:{db_params['port']}/{db_params['database']}") \
        .option("dbtable", "movies") \
        .option("user", db_params['user']) \
        .option("password", db_params['password']) \
        .load()
    return movies_df

# 장르 기반 추천 함수
def recommend_movies(spark, movies_df, preferred_genres, disliked_genres, num_recommendations=10):
    try:
        # 장르 벡터화
        cv = CountVectorizer(inputCol="genres_array", outputCol="genre_vector")
        cv_model = cv.fit(movies_df.withColumn("genres_array", split(col("genres"), "\\|")))
        movies_vectorized = cv_model.transform(movies_df.withColumn("genres_array", split(col("genres"), "\\|")))

        # 사용자 선호도 벡터 생성
        def create_user_vector(genres, disliked):
            return Vectors.dense([1 if g in genres else -1 if g in disliked else 0 for g in cv_model.vocabulary])

        user_vector = create_user_vector(preferred_genres, disliked_genres)

        # 가중치 적용 코사인 유사도 계산 함수
        def weighted_cosine_similarity(v1, v2):
            v1_array, v2_array = v1.toArray(), v2.toArray()
            dot_product = sum(a * b for a, b in zip(v1_array, v2_array) if b > 0)
            norm1 = sum(a * a for a in v1_array if a > 0) ** 0.5
            norm2 = sum(b * b for b in v2_array if b > 0) ** 0.5
            return float(dot_product / (norm1 * norm2)) if norm1 * norm2 != 0 else 0.0

        weighted_cosine_similarity_udf = udf(lambda v: weighted_cosine_similarity(v, user_vector), FloatType())

        # 추천 영화 찾기
        recommendations = (
            movies_vectorized
            .withColumn("similarity", weighted_cosine_similarity_udf(col("genre_vector")))
            .orderBy(col("similarity").desc())
            .filter(~expr("array_contains(genres_array, '" + "') AND NOT array_contains(genres_array, '".join(disliked_genres) + "')"))
            .limit(num_recommendations)
            .select("movie_id", "title", "genres", "similarity")
        )

        return recommendations

    except Exception as e:
        print(f"오류 발생: {str(e)}")
        return None

# Kafka로 추천 결과 전송
def send_recommendations_to_kafka(recommendations, kafka_producer, topic):
    for row in recommendations.collect():
        message = json.dumps({
            "movie_id": row["movie_id"],
            "title": row["title"],
            "genres": row["genres"].split("|"),
            "similarity": row["similarity"]
        })
        kafka_producer.send(topic, message.encode('utf-8'))

# PostgreSQL에 추천 결과 저장
def save_recommendations_to_postgres(recommendations, db_params):
    conn = psycopg2.connect(**db_params)
    cursor = conn.cursor()
    
    # recommendations 테이블이 없으면 생성
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS recommendations (
        id SERIAL PRIMARY KEY,
        movie_id INTEGER,
        title TEXT,
        genres TEXT[],
        similarity FLOAT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 데이터 삽입
    insert_query = """
    INSERT INTO recommendations (movie_id, title, genres, similarity)
    VALUES %s
    """
    recs_data = [
        (row["movie_id"], row["title"], row["genres"].split("|"), row["similarity"])
        for row in recommendations.collect()
    ]
    execute_values(cursor, insert_query, recs_data)

    conn.commit()
    cursor.close()
    conn.close()

# 메인 함수
def main():
    # Spark 세션 초기화
    spark = init_spark()

    # 데이터베이스 연결 정보
    db_params = {
        "host": "localhost",
        "port": "5432",
        "database": "netflix_db",
        "user": "your_username",
        "password": "your_password"
    }

    # 영화 데이터 로드
    movies_df = load_movie_data(spark, db_params)

    # 사용자 선호/불호 장르 (예시)
    preferred_genres = ["Action", "Sci-Fi"]
    disliked_genres = ["Romance"]

    # 영화 추천
    recommendations = recommend_movies(spark, movies_df, preferred_genres, disliked_genres)

    if recommendations is not None:
        # Kafka로 추천 결과 전송
        kafka_producer = KafkaProducer(bootstrap_servers=['localhost:9092'])
        send_recommendations_to_kafka(recommendations, kafka_producer, 'movie-recommendations')

        # PostgreSQL에 추천 결과 저장
        save_recommendations_to_postgres(recommendations, db_params)

        print("추천 완료: Kafka로 전송 및 PostgreSQL에 저장되었습니다.")
    else:
        print("추천 생성 중 오류가 발생했습니다.")

    # Spark 세션 종료
    spark.stop()

if __name__ == "__main__":
    main()
