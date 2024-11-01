import pandas as pd 
import ast 

df = pd.read_parquet('keyword.parquet')

def safe_eval(country):
    if isinstance(country, str):
        try:
            return ast.literal_eval(country)
        except (ValueError, SyntaxError):
            return []
    return []

df['country'] = df['country'].apply(safe_eval)

unique_countries = list(set(country for sublist in df['country'] for country in sublist))

for country in unique_countries:
    df[country] = df['country'].apply(lambda x: 1 if country in x else 0)
    
set(unique_countries)
print(df[unique_countries])