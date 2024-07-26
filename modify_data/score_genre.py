# import pandas as pd

# # CSV 파일 읽기
# df = pd.read_csv('/Users/c-28/Desktop/parquet_data/modify_data/imdb_movies_shows.csv')

# # 원하는 특정 컬럼 선택
# selected_columns = ['score', 'genres']  # 원하는 컬럼 이름을 리스트에 넣으세요
# new_df = df[selected_columns]

# # 새로운 CSV 파일로 저장
# new_df.to_csv('expel.csv', index=False)
import pandas as pd 

csv_file = 'expel.csv'
df = pd.read_csv(csv_file)

print(df)