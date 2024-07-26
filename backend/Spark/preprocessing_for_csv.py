from pyspark.sql import SparkSession
from pyspark.sql.functions import col, coalesce

# Spark 세션 생성
spark = SparkSession.builder.appName("NetflixDataFullOuterJoin").getOrCreate()

# CSV 파일 로드 (파일 경로 수정)
df1 = spark.read.csv("/home/ubuntu/moviesource/imdb_movies_shows.csv", header=True, inferSchema=True)
df2 = spark.read.csv("/home/ubuntu/moviesource/netflix_titles.csv", header=True, inferSchema=True)

# 공통 컬럼 식별
common_columns = list(set(df1.columns) & set(df2.columns))

# 전체 외부 조인 수행
joined_df = df1.join(df2, 
                     on=["title", "release_year"], 
                     how="full_outer")

# 중복 컬럼 처리
for col_name in common_columns:
    if col_name not in ["title", "release_year"]:
        joined_df = joined_df.withColumn(f"{col_name}_combined", 
                                         coalesce(col(f"{col_name}"), col(f"{col_name}_2")))
        joined_df = joined_df.drop(col_name, f"{col_name}_2")

# 컬럼 이름 정리
for col_name in joined_df.columns:
    if col_name.endswith("_combined"):
        joined_df = joined_df.withColumnRenamed(col_name, col_name[:-9])

# 결과 확인
joined_df.show()

# 결과를 새로운 CSV 파일로 저장
joined_df.write.csv("/home/ubuntu/moviesource/joined_data.csv", header=True, mode="overwrite")

# Spark 세션 종료
spark.stop()