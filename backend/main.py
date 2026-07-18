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
import requests
import time
from fastapi import UploadFile, File, Form
from fastapi.responses import JSONResponse, Response

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
    language: str = "en-IN"
class TTSRequest(BaseModel):
    text: str
    language: str = "en-IN"    


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
@app.post("/assistant")
def assistant(request: ChatRequest):
    start = time.time()
    language_names = {
        "en-IN": "English",
        "hi-IN": "Hindi",
        "te-IN": "Telugu",
        "ta-IN": "Tamil",
        "kn-IN": "Kannada",
        "bn-IN": "Bengali",
    }

    selected_language = language_names.get(
        request.language,
        "English"
    )

    # ---------- Chat ----------
    results = find_information(request.message)

    extra_context = ""

    for item in results:
        extra_context += f"\n\n### {item['type']}\n"

        for key, value in item["data"].items():
            extra_context += f"{key}: {value}\n"
    print("Calling OpenRouter...")
    response = client.chat.completions.create(
        model="deepseek/deepseek-chat-v3",
        max_tokens=250,
        messages=[
            {
                "role": "system",
                "content": SYSTEM_PROMPT,
            },
            {
                "role": "user",
                "content": f"""
            Respond ONLY in {selected_language}.

            IMPORTANT RULES:
            - Keep the answer under 80 words.
            - Finish the answer completely.
            - Never stop in the middle of a sentence or bullet point.
            - Use at most 5 bullet points.
            - Never exceed 6 short lines.
            - Do not write long paragraphs.
            - Use simple language.
            - Do not use Markdown.
            - Do not use **, ##, *, or numbered headings.
            - Do not mix English unless it is an official scheme name.
            - If the user wants more information, ask them to ask a follow-up question.



            {extra_context}

            Citizen Question:
            {request.message}
            """,
            },
        ],
    )

    reply = response.choices[0].message.content
    print(response.choices[0].finish_reason)
    print(f"OpenRouter took {time.time() - start:.2f} seconds")


    # ---------- Checklist ----------
    checklist = None

    for item in results:
        if item["type"] == "Service":

            service = item["data"]

            checklist = {
                "service": service["service"],
                "documents": service["documents"],
                "fees": service["fees"],
                "processing_time": service["processing_time"],
                "official_website": service["official_website"]
            }

            break


    # ---------- Recommendations ----------

    recommendation_query = request.message

    if request.language != "en-IN":

        translation = client.chat.completions.create(
            model="deepseek/deepseek-chat-v3",
            max_tokens=50,
            messages=[
                {
                    "role": "system",
                    "content": "Translate the following text into simple English. Return only the translation."
                },
                {
                    "role": "user",
                    "content": request.message
                }
            ]
        )

        recommendation_query = translation.choices[0].message.content.strip()

    print("Recommendation Query:", recommendation_query)

    recommendations = recommend_schemes(
        recommendation_query,
        SCHEMES
    )
    print("User message:", request.message)
    
    print("Recommendations found:", len(recommendations))

    summary = ""

    if recommendations:

        top = recommendations[:3]

        names = ", ".join(
            item["scheme"]["name"]
            for item in top
        )

        summary = (
            f"Based on your request, the most suitable government schemes are "
            f"{names}. These schemes match your profile and may provide financial "
            f"or service benefits. Check the eligibility criteria before applying."
        )


    return {
        "reply": reply,
        "summary": summary,
        "recommendations": recommendations,
        "checklist": checklist
    }

@app.post("/speech-to-text")
async def speech_to_text(
    audio_file: UploadFile = File(...),
    language: str = Form("en-IN")
):
    print("Selected language:", language)
    start = time.time()

    api_key = os.getenv("GNANI_API_KEY")

    url = "https://api.vachana.ai/stt/v3"

    headers = {
        "X-API-Key-ID": api_key
    }

    files = {
        "audio_file": (
            audio_file.filename,
            await audio_file.read(),
            audio_file.content_type,
        )
    }

    data = {
        "language_code": language,
        "preferred_language": language,
        "format": "transcribe",
        "itn_native_numerals": "true"
    }

    try:
        
        response = requests.post(
            url,
            headers=headers,
            files=files,
            data=data,
            timeout=60
        )
        print(f"STT took {time.time() - start:.2f} seconds")

        return response.json()

    except Exception as e:

        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e)
            }
        )
@app.post("/text-to-speech")
def text_to_speech(request: TTSRequest):
    start = time.time()

    api_key = os.getenv("GNANI_API_KEY")

    headers = {
        "Content-Type": "application/json",
        "X-API-Key-ID": api_key,
    }
    print("Text length:", len(request.text))
    print("Text:", request.text)

    payload = {
        "text": request.text,
        "voice": "Pranav",
        "model": "vachana-voice-v3",
        "audio_config": {
            "sample_rate": 44100,
            "num_channels": 1,
            "sample_width": 2,
            "encoding": "linear_pcm",
            "container": "wav"
        }
    }

    try:
        response = requests.post(
            "https://api.vachana.ai/api/v1/tts/inference",
            headers=headers,
            json=payload,
            timeout=60
        )
        print(f"TTS took {time.time() - start:.2f} seconds")

        print("=" * 60)
        print("Gnani Status:", response.status_code)
        print("Gnani Content-Type:", response.headers.get("content-type"))
        print("Response Preview:", response.text[:500])
        print("=" * 60)

        response.raise_for_status()

        return Response(
            content=response.content,
            media_type=response.headers.get("content-type", "audio/wav")
        )

    except Exception as e:
        import traceback
        traceback.print_exc()

        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e)
            }
        )