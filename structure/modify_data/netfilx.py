import pandas as pd 

df = pd.read_csv('/Users/c-28/Desktop/parquet_data/modify_data/netflix_titles.csv')

selected_column = ['description', 'director', 'cast', 'title', 'rating']
new_df = df[selected_column]

new_df.to_csv('modify.csv', index=False)