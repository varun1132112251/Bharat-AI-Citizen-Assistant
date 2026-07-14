from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI
import os
import json
from pathlib import Path
from utils.data_loader import load_schemes
from utils.recommendation_engine import recommend_schemes

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1",
)
DATA_DIR = Path(__file__).parent / "data"

# Load services
with open(DATA_DIR / "services.json", "r", encoding="utf-8") as f:
    SERVICES = json.load(f)

# Load documents
with open(DATA_DIR / "documents.json", "r", encoding="utf-8") as f:
    DOCUMENTS = json.load(f)

# Load all schemes from the schemes folder
SCHEMES = load_schemes()


class ChatRequest(BaseModel):
    message: str


SYSTEM_PROMPT = """
You are Bharat AI Citizen Assistant, an AI assistant built to help Indian citizens access government services easily.

Your primary responsibilities are:
- Explain Indian government schemes.
- Guide users through government services.
- Tell users about eligibility criteria.
- Provide document checklists.
- Explain application procedures step-by-step.
- Guide users about government certificates.
- Help citizens understand public welfare programs.

Greeting Rules:
- If the user says only "Hi", "Hello", "Hey", or similar greetings:
  - Reply with a short, friendly greeting.
  - Introduce yourself as Bharat AI Citizen Assistant.
  - Ask how you can help.
  - Do not list all your services unless requested.

Response Rules:
- Answer only questions related to India and Indian government services.
- Use simple, beginner-friendly English.
- Organize answers using headings and bullet points.
- Explain procedures step-by-step.
- Mention eligibility criteria whenever applicable.
- Mention required documents whenever applicable.
- Mention processing time if generally known.
- Mention fees if generally known.
- If the user's state matters, ask which state they belong to before answering.
- If information is uncertain, clearly say that the user should verify it on the official government website.
- Never invent government schemes or official rules.
- Be polite, professional, and concise.

Out-of-Scope Rules:
- If someone asks unrelated questions (movies, coding, jokes, sports, etc.), politely explain:
  "I specialize in Indian government services and citizen assistance. Please ask me about government schemes, certificates, documents, welfare programs, or public services."

Formatting Rules:
- Use headings.
- Use bullet points.
- Keep answers easy to read.
- Avoid long paragraphs.

Your goal is to make government services easy to understand for every Indian citizen.
"""
def find_information(user_message):
    message = user_message.lower()

    context = []

    # Search Services
    for service in SERVICES:
        if service["service"].lower() in message:
            context.append(
                {
                    "type": "Service",
                    "data": service
                }
            )

    # Search Schemes
    for scheme in SCHEMES:
        if scheme["name"].lower() in message:
            context.append(
                {
                    "type": "Scheme",
                    "data": scheme
                }
            )

    # Search Documents
    for document in DOCUMENTS:
        if document["document"].lower() in message:
            context.append(
                {
                    "type": "Document",
                    "data": document
                }
            )

    return context
def find_schemes(query: str):
    query = query.lower().strip()

    matches = []

    for scheme in SCHEMES:

        searchable_text = " ".join([
            scheme.get("name", ""),
            scheme.get("category", ""),
            scheme.get("subcategory", ""),
            scheme.get("description", ""),
            " ".join(scheme.get("keywords", [])),
            " ".join(scheme.get("benefits", [])),
            " ".join(scheme.get("eligibility", [])),
            " ".join(scheme.get("documents", [])),
            " ".join(scheme.get("target_groups", []))
        ]).lower()

        if query in searchable_text:
            matches.append(scheme)

    return matches

@app.post("/chat")
def chat(request: ChatRequest):

    results = find_information(request.message)

    extra_context = ""

    for item in results:

        extra_context += f"\n\n### {item['type']}\n"

        for key, value in item["data"].items():
            extra_context += f"{key}: {value}\n"

    response = client.chat.completions.create(
        model="meta-llama/llama-3.1-8b-instruct",
        messages=[
            {
                "role": "system",
                "content": SYSTEM_PROMPT,
            },
            {
                "role": "user",
                "content": f"{extra_context}\n\nCitizen Question:\n{request.message}",
            },
        ],
    )

    return {
        "reply": response.choices[0].message.content
    }
@app.post("/checklist")
def checklist(request: ChatRequest):

    results = find_information(request.message)

    for item in results:
        if item["type"] == "Service":
            service = item["data"]

            return {
                "service": service["service"],
                "documents": service["documents"],
                "fees": service["fees"],
                "processing_time": service["processing_time"],
                "official_website": service["official_website"]
            }

    return {
        "error": "No service found."
    }
@app.post("/find-schemes")
def find_scheme(request: ChatRequest):

    schemes = find_schemes(request.message)

    if not schemes:
        return {
            "success": False,
            "message": "No matching schemes found."
        }

    return {
        "success": True,
        "count": len(schemes),
        "schemes": schemes
    }
@app.post("/recommend")
def recommend(request: ChatRequest):

    recommendations = recommend_schemes(
        request.message,
        SCHEMES
    )

    if not recommendations:
        return {
            "success": False,
            "message": "No recommendations found."
        }

    return {
        "success": True,
        "recommendations": recommendations
    }
@app.post("/recommend-summary")
def recommend_summary(request: ChatRequest):

    recommendations = recommend_schemes(
        request.message,
        SCHEMES
    )

    if not recommendations:
        return {
            "success": False,
            "summary": "No suitable government schemes were found."
        }

    top_schemes = "\n".join(
        [
            f"- {item['scheme']['name']}: {item['scheme']['description']}"
            for item in recommendations[:3]
        ]
    )

    prompt = f"""
A citizen asked:

{request.message}

Recommended schemes:

{top_schemes}

Write a concise explanation (40-60 words).

Use only 3-4 short sentences.

Avoid repetition.

Keep the language simple.

Explain:
- Why these schemes were recommended.
- What benefit the citizen may get.
- Keep it simple and beginner friendly.
- Do not invent facts.
"""

    response = client.chat.completions.create(
        model="meta-llama/llama-3.1-8b-instruct",
        messages=[
            {
                "role": "system",
                "content": "You are Bharat AI Citizen Assistant."
            },
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return {
        "success": True,
        "summary": response.choices[0].message.content
    }