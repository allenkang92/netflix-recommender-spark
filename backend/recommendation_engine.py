from pyspark.sql import SparkSession
from pyspark.ml.feature import CountVectorizer
from pyspark.ml.linalg import Vectors, VectorUDT
from pyspark.sql.functions import udf, col, split, lit
from pyspark.sql.types import FloatType

def init_spark():
    return SparkSession.builder.appName("MovieRecommendation").getOrCreate()

def load_movie_data(spark, file_path):
    return spark.read.csv(file_path, header=True, inferSchema=True)

def recommend_movies(spark, movies_df, preferred_genres, disliked_genres, num_recommendations=10):
    try:
        # 장르 벡터화
        cv = CountVectorizer(inputCol="genres_array", outputCol="genre_vector")
        cv_model = cv.fit(movies_df.withColumn("genres_array", split(col("genres"), "\|")))
        movies_vectorized = cv_model.transform(movies_df.withColumn("genres_array", split(col("genres"), "\|")))

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
            .filter(~col("genres").rlike('|'.join(disliked_genres)))  # 불선호 장르 제외
            .limit(num_recommendations)
            .select("title", "genres", "similarity")
        )

        # 결과를 Python 리스트로 변환
        result = recommendations.collect()

        return [
            {
                "title": row["title"],
                "genres": row["genres"].split("|"),
                "similarity": row["similarity"]
            }
            for row in result
        ]
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return []

# 사용 예시
if __name__ == "__main__":
    spark = init_spark()
    movies_df = load_movie_data(spark, "path/to/your/movies.csv")
    recommendations = recommend_movies(spark, movies_df, ["Action", "Sci-Fi"], ["Romance"])
    print(recommendations)