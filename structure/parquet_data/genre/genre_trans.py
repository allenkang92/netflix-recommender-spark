import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq

csv_file = '/Users/c-28/Desktop/프로젝트/genre/imdb.csv'
parquet_file = 'keyword.parquet'
chunksize = 1000000

# CSV 파일을 읽을 때, 첫 번째 행이 헤더인 경우
csvStream = pd.read_csv(csv_file, chunksize=chunksize, low_memory=False)

# 장르 열만 선택
for i, chunk in enumerate(csvStream):
    print("Chunk", i)
    
    # 장르 열만 가져오기
    chunk = chunk[['genre']]

    # ParquetWriter 초기화
    if i == 0:
        parquet_schema = pa.schema([
            ('genre', pa.string())
        ])
        parquet_writer = pq.ParquetWriter(parquet_file, parquet_schema, compression='snappy')
    
    # Write CSV chunk to the parquet file
    table = pa.Table.from_pandas(chunk, schema=parquet_schema)
    parquet_writer.write_table(table)

parquet_writer.close()

