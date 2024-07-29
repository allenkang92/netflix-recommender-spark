from pyspark.sql import SparkSession
from pyspark.ml.feature import CountVectorizer
from pyspark.ml.linalg import Vectors
from pyspark.sql.functions import udf, col, split, expr, when, concat, lit, count, isnan, from_json
from pyspark.sql.types import FloatType, StructType, StructField, StringType, ArrayType
from kafka import KafkaProducer
import json
import os

# Kafka 설정
KAFKA_BOOTSTRAP_SERVERS = os.environ.get('KAFKA_BOOTSTRAP_SERVERS', '172.31.2.211:9092, 172.31.10.167:9092, 172.31.11.203:9092')
KAFKA_TOPIC_RECOMMENDATIONS = 'movie-recommendations'
KAFKA_TOPIC_USER_ACTIVITIES = 'user-activities'

def init_spark():
    return SparkSession.builder \
        .appName("NetflixRecommendation") \
        .config("spark.jars.packages", "org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.0") \
        .getOrCreate()

def load_movie_data(spark, file_path):
    return spark.read.parquet(file_path)

def recommend_movies(spark, movies_df, preferred_genres, disliked_genres, num_recommendations=10):
    try:
        # Null 값 처리
        movies_df = movies_df.withColumn("genres", 
                                         when(col("genres").isNull(), "Unknown")
                                         .otherwise(col("genres")))
        movies_df = movies_df.withColumn("imdb_score", 
                                         when(col("imdb_score").isNull(), 0.0)
                                         .otherwise(col("imdb_score")))
        
        # 유니크 식별자 생성
        movies_df = movies_df.withColumn("unique_id", concat(col("title"), lit("_"), col("imdb_score").cast("string")))
        
        # 장르 벡터화
        cv = CountVectorizer(inputCol="genres_array", outputCol="genre_vector", minDF=1.0)
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
            .select("unique_id", "title", "genres", "similarity", "imdb_score")
        )

        return recommendations

    except Exception as e:
        print(f"오류 발생: {str(e)}")
        return None

def format_recommendations(recommendations):
    return [
        {
            "unique_id": row["unique_id"],
            "title": row["title"],
            "genres": row["genres"].split("|") if row["genres"] else [],
            "similarity": float(row["similarity"]) if row["similarity"] is not None else 0.0,
            "imdb_score": float(row["imdb_score"]) if row["imdb_score"] is not None else 0.0
        }
        for row in recommendations.collect()
    ]

def send_recommendations_to_kafka(spark, recommendations):
    recommendation_df = spark.createDataFrame([(json.dumps(recommendations),)],['value'])
    recommendation_df \
        .selectExpr("CAST(value AS STRING) AS value") \
        .write \
        .format("kafka") \
        .option("kafka.bootstrap.servers", KAFKA_BOOTSTRAP_SERVERS) \
        .option("topic", KAFKA_TOPIC_RECOMMENDATIONS) \
        .save()
    print("추천 결과가 Kafka로 전송되었습니다.")

def process_kafka_stream(spark, movies_df):
    # Kafka에서 사용자 활동 데이터 읽기
    user_activity_df = spark \
        .readStream \
        .format("kafka") \
        .option("kafka.bootstrap.servers", KAFKA_BOOTSTRAP_SERVERS) \
        .option("subscribe", KAFKA_TOPIC_USER_ACTIVITIES) \
        .load()

    # 사용자 활동 데이터 스키마 정의
    user_activity_schema = StructType([
        StructField("user_id", StringType(), True),
        StructField("preferred_genres", ArrayType(StringType()), True),
        StructField("disliked_genres", ArrayType(StringType()), True)
    ])

    # JSON 파싱
    parsed_df = user_activity_df.select(
        from_json(user_activity_df.value.cast("string"), user_activity_schema).alias("data")
    ).select("data.*")

    # 스트리밍 처리 함수 정의
    def process_batch(batch_df, batch_id):
        for row in batch_df.collect():
            user_id = row['user_id']
            preferred_genres = row['preferred_genres']
            disliked_genres = row['disliked_genres']
            
            recommendations = recommend_movies(spark, movies_df, preferred_genres, disliked_genres)
            
            if recommendations is not None:
                formatted_recommendations = format_recommendations(recommendations)
                send_recommendations_to_kafka(spark, formatted_recommendations)
                print(f"User {user_id}의 추천이 생성되어 Kafka로 전송되었습니다.")

    # 스트리밍 쿼리 시작
    query = parsed_df \
        .writeStream \
        .foreachBatch(process_batch) \
        .start()

    query.awaitTermination()

def main():
    # Spark 세션 초기화
    spark = init_spark()

    # Parquet 파일 경로
    parquet_file_path = "/home/ubuntu/spark/keyword.parquet"

    # 영화 데이터 로드
    movies_df = load_movie_data(spark, parquet_file_path)

    # 데이터 확인
    print("데이터 샘플:")
    movies_df.show(5)
    print("스키마:")
    movies_df.printSchema()

    # Null 값 개수 확인
    null_counts = movies_df.select([count(when(col(c).isNull() | isnan(c), c)).alias(c) for c in movies_df.columns])
    print("Null 값 개수:")
    null_counts.show()

    # 사용자 선호/불호 장르 (예시)
    preferred_genres = ["Action", "Sci-Fi"]
    disliked_genres = ["Romance"]

    # 영화 추천
    recommendations = recommend_movies(spark, movies_df, preferred_genres, disliked_genres)

    if recommendations is not None:
        # 추천 결과 포맷팅
        formatted_recommendations = format_recommendations(recommendations)
        
        # 결과 출력 (실제로는 여기서 백엔드로 전송)
        print(json.dumps(formatted_recommendations, indent=2))
        print("추천이 성공적으로 생성되었습니다.")

        # Kafka로 추천 결과 전송
        send_recommendations_to_kafka(spark, formatted_recommendations)
    else:
        print("추천 생성 중 오류가 발생했습니다.")

    # Kafka에서 사용자 활동 데이터 읽기 및 처리
    process_kafka_stream(spark, movies_df)

    # Spark 세션 종료
    spark.stop()

if __name__ == "__main__":
    main()
