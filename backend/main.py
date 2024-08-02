from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from typing import Optional, List
from pydantic import BaseModel, Field
import pandas as pd
import ast
from kafka import KafkaProducer

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Genres(BaseModel):
    positive: list
    negative: list
    
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "positive": ['scifi', 'drama', 'fantasy'],
                    "negative": ['family', 'animation']
                },
            ]
        }
    }
    
class Movie(BaseModel):
    title: str
    rating: str
    imdb_score: Optional[float] = None
    genres: Optional[List[str]] = Field(default_factory=list)
    description: Optional[str] = None
    director: Optional[str] = None
    cast: Optional[str] = None
    
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "title": "The Exorcist",
                    "rating": "PG-13",
                    "imdb_score": 4.8,
                    "genres": ['thriller', 'scifi', 'drama', 'fantasy', 'horror'],
                    "description": "A young woman conducts a search for her twin sister, who disappeared in a notorious area of Japan known as the Suicide Forest.",
                    "director": "Jason Zada",
                    "cast": "Natalie Dormer, Taylor Kinney, Yukiyoshi Ozawa, Eoin Macken, Stephanie Vogt, Rina Takasaki, Noriko Sakura, Yuho Yamashita",
                },
            ]
        }
    }

@app.get("/top20")
def read_item() -> List[Movie]:
    categories = ["title", "rating", "imdb_score", "genres", "description", "director", "cast"]
    result = pd.read_parquet('../pyspark/keyword.parquet', engine='pyarrow')
    result = result.drop_duplicates(subset=['title'])
    
    top20 = result.sort_values(by=['imdb_score'], axis=0, ascending=False).head(20)
    top20list = top20[categories].values.tolist()
        
    movie_list = []
    for item in top20list:
        movie_dict = dict(zip(categories, item))
        
        # 데이터 정제
        if pd.isna(movie_dict['imdb_score']):
            movie_dict['imdb_score'] = None
        
        if pd.isna(movie_dict['genres']):
            movie_dict['genres'] = []
        elif isinstance(movie_dict['genres'], str):
            try:
                movie_dict['genres'] = eval(movie_dict['genres'])
            except:
                movie_dict['genres'] = [movie_dict['genres']]
        
        for field in ['description', 'director', 'cast']:
            if pd.isna(movie_dict[field]):
                movie_dict[field] = None
        
        movie_list.append(Movie(**movie_dict))
    
    return movie_list

@app.post("/recommend")
def update_item(genres: Genres) -> List[Movie]:
    # Kafka 브로커 주소 설정
    bootstrap_servers = ['localhost:9092']

    # KafkaProducer 인스턴스 생성
    producer = KafkaProducer(
        bootstrap_servers=bootstrap_servers,
        value_serializer=lambda v: v.encode('utf-8')  # 문자열을 UTF-8로 인코딩
    )

    # 사용 예시
    topic = 'fast_api'

    for message in genres.positive:
        # 메시지 전송 함수
        future = producer.send(topic, message)
        try:
            record_metadata = future.get(timeout=10)
            print(f"Message sent successfully to {record_metadata.topic}")
        except Exception as e:
            print(f"Error sending message: {e}")

    # 프로듀서 종료
    producer.close()

    # 파케이 파일 읽기
    result = pd.read_parquet('../pyspark/keyword.parquet', engine='pyarrow')
    
    # 모든 장르 컬럼 가져오기
    genre_columns = [col for col in result.columns if col in genres.positive + genres.negative]
    
    # Positive 점수 계산
    result['positive_score'] = result[genres.positive].sum(axis=1)
    
    # Negative 조건 적용
    condition = pd.Series(True, index=result.index)
    for col in genres.negative:
        condition &= (result[col] != 1)
    
    # 조건을 만족하는 영화 선택 및 정렬 (positive_score 내림차순, rating 내림차순)
    recommended = result[condition].sort_values(by=['positive_score', 'rating'], ascending=[False, False])
    
    # 상위 20개 선택 (20개 미만일 경우 가능한 만큼)
    top20 = recommended.head(20)
    
    # 결과를 Movie 객체 리스트로 변환
    movie_list = []
    for _, movie in top20.iterrows():
        genres_list = [col for col in genre_columns if movie[col] == 1]
        movie_dict = {
            "title": movie['title'],
            "rating": movie['rating'],
            "imdb_score": movie['imdb_score'] if pd.notna(movie['imdb_score']) else None,
            "genres": genres_list,
            "description": movie['description'] if pd.notna(movie['description']) else None,
            "director": movie['director'] if pd.notna(movie['director']) else None,
            "cast": movie['cast'] if pd.notna(movie['cast']) else None
        }
        movie_list.append(Movie(**movie_dict))
    
    return movie_list