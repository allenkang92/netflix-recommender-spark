import pandas as pd 
import ast 

df = pd.read_parquet('keyword.parquet')

def safe_eval(language):
    if isinstance(language, str):
        try:
            return ast.literal_eval(language)
        except (ValueError, SyntaxError):
            return []
    return []

df['language'] = df['language'].apply(safe_eval)

unique_language = list(set(language for sublist in df['language'] for language in sublist))

for language in unique_language:
    df[language] = df['language'].apply(lambda x: 1 if language in x else 0)
    
set(unique_language)
print(df[unique_language])