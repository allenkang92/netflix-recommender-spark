from pyspark.sql import SparkSession
from pyspark.sql.functions import from_json, col
from pyspark.sql.types import StructType, StructField, StringType, ArrayType, FloatType
import logging
import ast
import psycopg2

def test_connection():
    try:
        conn = psycopg2.connect(
            host="localhost",
            database="your_database",
            user="your_username",
            password="your_password"
        )
        cur = conn.cursor()
        cur.execute("SELECT 1")
        print("연결 성공!")
        conn.close()
    except Exception as e:
        print(f"연결 실패: {str(e)}")

test_connection()

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def init_spark():
    return SparkSession.builder \
        .appName("NetflixRecommendationStreaming") \
        .config("spark.jars.packages", "org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.0,org.postgresql:postgresql:42.2.18") \
        .config("spark.driver.extraClassPath", "/path/to/postgresql-42.2.18.jar") \
        .getOrCreate()

def process_streaming_data(spark):
    try:
        # Kafka에서 데이터 읽기
        df = spark \
            .readStream \
            .format("kafka") \
            .option("kafka.bootstrap.servers", "localhost:9092") \
            .option("subscribe", "movie-recommendations") \
            .load()
        
        logger.info("Kafka 스트림 연결 성공")

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
            try:
                df.write \
                    .jdbc(url="jdbc:postgresql://localhost:5432/postgres",
                          table="movie_recommendations",
                          mode="append",
                          properties={
                              "user": "postgres",
                              "password": "postgres",
                              "driver": "org.postgresql.Driver",
                              "autocommit": "true"
                          })
                logger.info(f"Batch {epoch_id}: 데이터 성공적으로 PostgreSQL에 기록")
            except Exception as e:
                logger.error(f"Batch {epoch_id}: PostgreSQL 기록 중 오류 발생 - {str(e)}")

        # 스트리밍 쿼리 시작
        query = parsed_df \
            .writeStream \
            .foreachBatch(write_to_postgres) \
            .start()

        logger.info("스트리밍 쿼리 시작")
        query.awaitTermination()

    except Exception as e:
        logger.error(f"Streaming 처리 중 오류 발생: {str(e)}")

def format_genres(genres_str):
    try:
        genres_list = ast.literal_eval(genres_str)
        return genres_list
    except:
        return []

def process_batch(df, epoch_id):
    try:
        # genres 필드 변환
        df = df.withColumn("genres", udf(format_genres, ArrayType(StringType()))(col("genres")))
        
        df.write \
            .jdbc(url="jdbc:postgresql://localhost:5432/postgres",
                  table="movie_recommendations",
                  mode="append",
                  properties={
                      "user": "your_username",
                      "password": "your_password",
                      "driver": "org.postgresql.Driver",
                      "autocommit": "true"
                  })
        logger.info(f"Batch {epoch_id}: 데이터 성공적으로 PostgreSQL에 기록")
    except Exception as e:
        logger.error(f"Batch {epoch_id}: PostgreSQL 기록 중 오류 발생 - {str(e)}")

def main():
    try:
        spark = init_spark()
        logger.info("Spark 세션 초기화 완료")
        process_streaming_data(spark)
    except Exception as e:
        logger.error(f"메인 프로세스 실행 중 오류 발생: {str(e)}")
    finally:
        if 'spark' in locals():
            spark.stop()
            logger.info("Spark 세션 종료")

if __name__ == "__main__":
    main()