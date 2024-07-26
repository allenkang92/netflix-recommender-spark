from typing import Union

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Genres(BaseModel):
    positive: list
    negative: list
    
class Movie(BaseModel):
    title: str
    rating: str
    score: float
    genres: list
    description: str
    director: str
    cast: str

@app.get("/top20")
def read_item() -> list:
    return []

@app.put("/recommend")
def update_item(genres: Genres) -> list:
    print(genres.positive, genres.negative)
    return []