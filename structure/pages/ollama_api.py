import requests
import json

def query_ollama(prompt, model="llama3"):
    url = "http://localhost:11434/api/generate"
    
    payload = json.dumps({
        "model": model,
        "prompt": prompt
    })
    
    headers = {
        'Content-Type': 'application/json'
    }
    
    response = requests.post(url, headers=headers, data=payload)
    
    if response.status_code == 200:
        response_text = response.text.strip().split('\n')[-1]
        result = json.loads(response_text)
        return result.get('response', '')
    else:
        return f"Error: {response.status_code}, {response.text}"