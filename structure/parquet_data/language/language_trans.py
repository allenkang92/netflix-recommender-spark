import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq

csv_file = '/Users/c-28/Desktop/프로젝트/archive/imdb.csv'
parquet_file = 'keyword.parquet'
chunksize = 1000000

csvStream = pd.read_csv(csv_file, chunksize=chunksize, low_memory=False)

for i, chunk in enumerate(csvStream):
    print("chunk", i)
    
    chunk = chunk[['language']]
    
    if i == 0:
        parquet_schema = pa.schema([
            ('language', pa.string())
        ])
        parquet_writer = pq.ParquetWriter(parquet_file, parquet_schema, compression='snappy')
          
    table = pa.Table.from_pandas(chunk, schema=parquet_schema)
    parquet_writer.write_table(table)
    
parquet_writer.close()