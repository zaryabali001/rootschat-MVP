from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from PyPDF2 import PdfReader
from anthropic import Anthropic
import uuid
import re
from typing import Dict

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CLAUDE_API_KEY = "YOUR_CLAUDE_API_KEY_HERE"

client = Anthropic(api_key=CLAUDE_API_KEY)

# Store full extracted PDF text for each chatbot
chatbots: Dict[str, str] = {}

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def home():
    with open("index.html", "r", encoding="utf-8") as f:
        return f.read()

@app.post("/create_chatbot")
async def create_chatbot(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    reader = PdfReader(file.file)
    text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"

    text = re.sub(r'\s+', ' ', text).strip()

    if len(text) < 50:
        raise HTTPException(status_code=400, detail="PDF contains too little text")

    # Claude 3 Haiku supports up to 200k tokens — very generous
    if len(text) > 180000:
        text = text[:180000] + "\n\n[Content truncated for optimal performance]"

    chatbot_id = str(uuid.uuid4())
    chatbots[chatbot_id] = text

    embed_code = f"""<script src="YOUR_DEPLOYED_URL/static/chat-widget.js"></script>
<script>
    initChatWidget("{chatbot_id}", "YOUR_DEPLOYED_URL");
</script>"""

    note = "<!-- Replace YOUR_DEPLOYED_URL with your actual server URL (e.g. https://yourapp.onrender.com) -->"

    return {
        "message": "Claude AI-Powered Chatbot created successfully! 🤖",
        "chatbot_id": chatbot_id,
        "embed_code": embed_code + "\n" + note
    }

@app.post("/ask_question")
async def ask_question(chatbot_id: str = Form(...), question: str = Form(...)):
    if chatbot_id not in chatbots:
        raise HTTPException(status_code=404, detail="Chatbot not found or expired")

    pdf_text = chatbots[chatbot_id]
    question = question.strip()

    if not question:
        return {"answer": "Please ask a question."}

    try:
        message = client.messages.create(
            model="claude-3-haiku-20240307",  # Fast, accurate, and cost-effective
            # Use "claude-3-sonnet-20240229" or "claude-3-opus-20240229" for smarter responses if needed
            max_tokens=600,
            temperature=0.3,
            system="You are an expert assistant that answers questions based ONLY on the provided PDF content. "
                   "Be accurate, concise, natural, and helpful. "
                   "If the answer is not in the PDF, respond with: "
                   "'I couldn’t find that information in the PDF.'",
            messages=[
                {
                    "role": "user",
                    "content": f"PDF Content:\n\"\"\"\n{pdf_text}\n\"\"\"\n\nQuestion: {question}"
                }
            ]
        )

        answer = message.content[0].text.strip()

    except Exception as e:
        answer = "Sorry, there was an error contacting Claude AI. Please try again."

    return {"answer": answer}

@app.get("/chat/{chatbot_id}", response_class=HTMLResponse)
async def embedded_chat(chatbot_id: str):
    if chatbot_id not in chatbots:
        return HTMLResponse(content="<h3 style='text-align:center;padding:80px;color:#999;'>Chatbot not found or expired.</h3>", status_code=404)

    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RootsChat MVP - Powered by RootsAI</title>
    <link rel="stylesheet" href="/static/style.css">
</head>
<body>
    <div id="chat-section">
        <div id="chat-window">
            <div class="chat-bubble bot-bubble">
                Hello! I'm RootsChat. Upload a PDF and ask me anything about its content! 📄✨
            </div>
        </div>
        <div class="input-area">
            <input type="text" id="question-input" placeholder="Ask about the PDF...">
            <button id="send-question">Send</button>
        </div>
    </div>
    <script>
        window.chatbotId = "{chatbot_id}";
    </script>
    <script src="/static/script.js"></script>
</body>
</html>
"""