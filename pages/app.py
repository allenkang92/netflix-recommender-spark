from flask import Flask, request, jsonify
from flask_cors import CORS
from ollama_api import query_ollama

app = Flask(__name__)
CORS(app)

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    prompt = data.get('message', '')
    response = query_ollama(prompt)
    return jsonify({'response': response})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)