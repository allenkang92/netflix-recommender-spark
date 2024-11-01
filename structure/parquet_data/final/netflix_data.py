import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq

csv_file = './merged_imdb_with_genres.csv'  # .csv 확장자 추가
parquet_file = 'netflix_parquet'  # .parquet 확장자 추가
chunksize = 100000

csv_stream = pd.read_csv(csv_file, chunksize=chunksize, low_memory=False)

for i, chunk in enumerate(csv_stream):  # csv_file을 csv_stream으로 수정
    print(f"Processing chunk: {i}")
    table = pa.Table.from_pandas(chunk)
    
    if i == 0:
        parquet_writer = pq.ParquetWriter(parquet_file, table.schema)
    
    parquet_writer.write_table(table)

parquet_writer.close()
