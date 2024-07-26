from typing import Union

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

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
    imdb_score: float
    genres: list
    description: str
    director: str
    cast: str
    
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
def read_item() -> list[Movie]:
    return []

@app.post("/recommend")
def update_item(genres: Genres) -> list[Movie]:
    print(genres.positive, genres.negative)
    return []