import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq

csv_file = 'merged_imdb_with_genres.csv'
parquet_file = 'keyword.parquet'
chunk_size = 100000

csv_stream = pd.read_csv(csv_file, chunksize=chunk_size, low_memory=False)

# 첫 번째 청크로 스키마 생성
first_chunk = next(csv_stream)
parquet_schema = pa.Table.from_pandas(df=first_chunk).schema

# Parquet 작성기 생성
parquet_writer = pq.ParquetWriter(parquet_file, parquet_schema, compression='snappy')

# 첫 번째 청크 쓰기
table = pa.Table.from_pandas(first_chunk, schema=parquet_schema)
parquet_writer.write_table(table)

# 나머지 청크 처리
for i, chunk in enumerate(csv_stream, 1):
    print(f"Processing chunk: {i}")
    table = pa.Table.from_pandas(chunk, schema=parquet_schema)
    parquet_writer.write_table(table)

# 파일 닫기
parquet_writer.close()


