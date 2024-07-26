import pandas as pd
import ast

# Parquet 파일 읽기
df = pd.read_parquet('keyword.parquet')

# 장르 리스트를 안전하게 변환하는 함수 정의
def safe_eval(genres):
    if isinstance(genres, str):
        try:
            return ast.literal_eval(genres)
        except (ValueError, SyntaxError):
            return []  # 잘못된 형식일 경우 빈 리스트 반환
    return []  # None인 경우 빈 리스트 반환

# 장르 리스트를 안전하게 변환
df['genres'] = df['genres'].apply(safe_eval)

# 모든 고유 장르를 추출하여 리스트로 변환 (중복 제거)
unique_genres = list(set(genres for sublist in df['genres'] for genres in sublist))

# 고유 장르를 기준으로 새로운 컬럼 생성
for genres in unique_genres:
    df[genres] = df['genres'].apply(lambda x: 1 if genres in x else 0)

# 결과 출력
# set(unique_genres)
# print(df[unique_genres])  


df = df.drop('genres', axis=1)

print(df[unique_genres])

df[unique_genres].to_csv('genre_matrix.csv', index=False)
