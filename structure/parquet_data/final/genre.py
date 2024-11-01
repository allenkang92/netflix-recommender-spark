import pandas as pd
import ast

# Parquet 파일 읽기
df = pd.read_parquet('keyword.parquet')

# 장르 리스트를 안전하게 변환하는 함수 정의
def safe_eval(genre):
    if isinstance(genre, str):
        try:
            return ast.literal_eval(genre)
        except (ValueError, SyntaxError):
            return []  # 잘못된 형식일 경우 빈 리스트 반환
    return []  # None인 경우 빈 리스트 반환

# 장르 리스트를 안전하게 변환
df['genre'] = df['genre'].apply(safe_eval)

# 모든 고유 장르를 추출하여 리스트로 변환 (중복 제거)
unique_genres = list(set(genre for sublist in df['genre'] for genre in sublist))

# 고유 장르를 기준으로 새로운 컬럼 생성
for genre in unique_genres:
    df[genre] = df['genre'].apply(lambda x: 1 if genre in x else 0)

# 결과 출력
# set(unique_genres)
# print(df[unique_genres])  


df = df.drop('genre', axis=1)

print(df[unique_genres])

df[unique_genres].to_csv('genre_matrix.csv', index=False)
