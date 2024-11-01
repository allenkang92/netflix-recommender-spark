from flask import Flask, request, jsonify
import requests
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})  # 모든 도메인 허용

OLLAMA_URL = 'http://localhost:11434'  # Ollama 서버의 URL

@app.route('/api/generate', methods=['POST'])
def proxy_to_ollama():
    data = request.json
    try:
        response = requests.post(f"{OLLAMA_URL}/api/generate", json=data)
        response.raise_for_status()

        # 응답을 한 줄씩 파싱
        response_lines = response.text.strip().split('\n')
        combined_response = []

        for line in response_lines:
            try:
                response_json = json.loads(line)
                combined_response.append(response_json['response'])
            except json.JSONDecodeError:
                app.logger.error(f"JSON decode error in line: {line}")

        return jsonify({"response": ''.join(combined_response)})
    except requests.RequestException as e:
        app.logger.error(f"Request error: {e}")
        return jsonify({"error": "Failed to fetch response from Ollama"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
