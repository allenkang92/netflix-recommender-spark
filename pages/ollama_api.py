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
        # Ollama returns multiple JSON objects, we'll take the last one
        response_text = response.text.strip().split('\n')[-1]
        result = json.loads(response_text)
        return result.get('response', '')
    else:
        return f"Error: {response.status_code}, {response.text}"

# 이 부분은 테스트용이며, 모듈로 import할 때는 실행되지 않습니다.
if __name__ == "__main__":
    prompt = "Tell me about the movie Inception"
    response = query_ollama(prompt)
    print(response)