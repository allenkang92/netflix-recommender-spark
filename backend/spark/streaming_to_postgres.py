from pyspark.sql import SparkSession
from pyspark.sql.functions import from_json, col
from pyspark.sql.types import StructType, StructField, StringType, ArrayType, FloatType

def init_spark():
    return SparkSession.builder \
        .appName("NetflixRecommendationStreaming") \
        .config("spark.jars.packages", "org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.0,org.postgresql:postgresql:42.2.18") \
        .getOrCreate()

def process_streaming_data(spark):
    # Kafka에서 데이터 읽기
    df = spark \
        .readStream \
        .format("kafka") \
        .option("kafka.bootstrap.servers", "localhost:9092") \
        .option("subscribe", "movie-recommendations") \
        .load()

    # 스키마 정의
    schema = StructType([
        StructField("unique_id", StringType(), True),
        StructField("title", StringType(), True),
        StructField("genres", ArrayType(StringType()), True),
        StructField("similarity", FloatType(), True),
        StructField("imdb_score", FloatType(), True)
    ])

    # JSON 파싱
    parsed_df = df.select(from_json(col("value").cast("string"), schema).alias("data")).select("data.*")

    # PostgreSQL에 데이터 쓰기
    def write_to_postgres(df, epoch_id):
        df.write \
            .jdbc(url="jdbc:postgresql://localhost:5432/your_database",
                  table="movie_recommendations",
                  mode="append",
                  properties={"user": "your_username", "password": "your_password"})

    # 스트리밍 쿼리 시작
    query = parsed_df \
        .writeStream \
        .foreachBatch(write_to_postgres) \
        .start()

    query.awaitTermination()

def main():
    spark = init_spark()
    process_streaming_data(spark)

if __name__ == "__main__":
    main()