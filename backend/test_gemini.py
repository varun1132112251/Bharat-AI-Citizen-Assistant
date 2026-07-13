from google import genai
from dotenv import load_dotenv
import os

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

try:
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents="Say only: Hello"
    )
    print("SUCCESS:")
    print(response.text)

except Exception as e:
    print("ERROR:")
    print(e)