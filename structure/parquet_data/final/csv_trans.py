import pandas as pd 
import numpy as np 



def scv_read():
    csv_file = './imdb.csv'

    df = pd.read_csv(csv_file)
    df_drop= df.drop([ 'genre'], axis=1)
    df_drop.to_csv('new_imdb.csv', index=False)

print(scv_read())

