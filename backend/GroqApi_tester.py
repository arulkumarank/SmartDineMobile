import requests
from dotenv import load_dotenv
import os

load_dotenv()

groq_api_key = os.getenv("GROQ_API_KEY")

url = "https://api.groq.com/openai/v1/chat/completions"

headers = {
    "Authorization": f"Bearer {groq_api_key}",
    "Content-Type": "application/json"
}

data = {
    "model" : "llama3.2",
    "messages": [
        {"role" : "user", "content": "Hello, how are you?"}
    ],
    "temperature": 0.7
}

response = requests.post(url, headers=headers, json=data)
result = response.json()
print(result["choices"][0]["message"]["content"])
