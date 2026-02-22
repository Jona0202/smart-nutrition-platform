"""Test script to list available Gemini models"""
import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')
client = genai.Client(api_key=api_key)

print("Available models with generateContent:")
for model in client.models.list():
    print(model.name)
