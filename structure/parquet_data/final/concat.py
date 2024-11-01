import pandas as pd 

df1 = pd.read_csv('new_imdb.csv')

df2 = pd.read_csv('genre_matrix.csv')

if 'index' in df1.columns and 'index' in df2.columns:
    merged_df = pd.merge(df1, df2, on='index')
else:
    merged_df = pd.concat([df1, df2], axis=1)
    
merged_df.to_csv('merged_imdb_with_genres.csv', index=False)