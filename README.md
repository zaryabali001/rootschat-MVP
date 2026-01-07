# RootsChat MVP - AI PDF Chatbot Builder

A modern, full-featured AI chatbot application that allows users to upload PDFs and create intelligent chatbots powered by Claude AI.

## 🚀 Features

### Core Features

- **PDF Upload & Processing**: Upload any PDF file and extract its content
- **AI-Powered Chatbot**: Uses Claude 3 Haiku for fast, accurate responses
- **Embeddable Widget**: Easy integration into any website
- **Modern UI**: Beautiful, responsive design with smooth animations
- **Real-time Chat**: Instant message delivery with typing indicators
- **Message Formatting**: Markdown-like support (bold, italic, links)
- **Conversation History**: Keeps track of chat messages

### Technical Highlights

- **FastAPI Backend**: High-performance Python web framework
- **Session Management**: Unique chatbot IDs with secure storage
- **CORS Support**: Cross-origin requests enabled for embedding
- **Error Handling**: Graceful error messages and fallbacks
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Token Optimization**: Intelligent PDF truncation for API limits

## 📋 Project Structure


rootschat-MVP/
├── index.html                 # Landing & builder page
├── main.py                    # FastAPI backend application
├── requirements.txt           # Python dependencies
└── static/
    ├── style.css             # Main styling
    ├── script.js             # Landing page & builder logic
    ├── chat-widget.js        # Floating widget for external sites
    ├── chatbot.css           # Chat interface styles
    └── chatbot.js            # Chat interaction logic
```

## 🛠️ Setup & Installation

### Prerequisites

- Python 3.8+
- pip (Python package manager)
- Modern web browser
- Anthropic API key (Claude)

### Step 1: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 2: Set API Key

Edit `main.py` and replace `YOUR_CLAUDE_API_KEY_HERE` with your actual Anthropic API key:

```python
CLAUDE_API_KEY = "sk-ant-YOUR_ACTUAL_KEY_HERE"
```

**Better approach** - Use environment variable:

```python
import os
CLAUDE_API_KEY = os.getenv("ANTHROPIC_API_KEY", "default-key")
```

Then set the environment variable:

```bash
# Windows
set ANTHROPIC_API_KEY=sk-ant-xxx

# macOS/Linux
export ANTHROPIC_API_KEY=sk-ant-xxx
```

### Step 3: Run the Server

```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The application will be available at: `http://localhost:8000`

## 🎯 How It Works

### User Flow

1. **Landing Page**: User sees the RootsChat marketing page
2. **PDF Upload**: User clicks "Get Started" and uploads a PDF
3. **Chatbot Creation**: Backend extracts PDF text and generates embed code
4. **Test/Embed**: User can test the chatbot or copy embed code

### Technical Flow


PDF Upload
    ↓
PDFReader (PyPDF2) extracts text
    ↓
Text cleaned & truncated (max 180k chars)
    ↓
Stored in chatbots{} dictionary with UUID
    ↓
Embed code generated with chatbot_id
    ↓
User asks question
    ↓
Claude API receives PDF context + question
    ↓
Response returned with streaming/formatting
    ↓
Message displayed in chat interface

## 📝 API Endpoints

### `GET /`

Returns the landing page HTML.

### `POST /create_chatbot`

Creates a new chatbot from an uploaded PDF.

**Request:**

- `file`: PDF file (multipart/form-data)

**Response:**

```json
{
  "message": "Claude AI-Powered Chatbot created successfully! 🤖",
  "chatbot_id": "12345-uuid-here",
  "embed_code": "<script>...</script>"
}
```

### `POST /ask_question`

Sends a question to a specific chatbot.

**Request:**

```

chatbot_id=<id>
question=<user question>


**Response:**

```json
{
  "answer": "The AI response based on the PDF content..."
}
```

### `GET /chat/{chatbot_id}`

Loads the embedded chat interface for a specific chatbot.

## 🎨 Customization

### Chat Interface Colors

Edit `static/chatbot.css`:

```css
:root {
    --primary-gradient: linear-gradient(135deg, #ff6b6b, #4ecdc4);
    --text-dark: #333333;
    --text-light: #999999;
    /* ... more colors ... */
}
```

### Chat Widget Styling

Edit `static/chat-widget.js`:

- Change button colors in `.rootschat-toggle`

- Adjust popup window size in `.rootschat-window`
- Customize header text and colors

### Landing Page

Edit `index.html`:

- Modify hero text
- Change button styling
- Adjust animations

## 🔒 Security Considerations

1. **API Key Security**: Never commit real API keys. Use environment variables.
2. **Input Validation**: PDF files are validated before processing
3. **Rate Limiting**: Consider adding rate limiting for production
4. **CORS**: Currently open to all origins - restrict in production:

   ```python
   allow_origins=["yourdomain.com"]

   ```

5. **Session Storage**: Chatbots are stored in memory - use database for persistence

## 🚀 Deployment

### Deploy to Render (Recommended)

1. Push to GitHub
2. Connect to Render
3. Set environment variable: `ANTHROPIC_API_KEY`
4. Deploy with Python environment

### Deploy to Heroku

```bash
# Create Procfile
echo "web: uvicorn main:app --host 0.0.0.0 --port $PORT" > Procfile

# Deploy
git push heroku main
```


### Self-Hosted (AWS/DigitalOcean)

1. Install Python and dependencies
2. Run server with process manager (systemd, supervisor)
3. Use reverse proxy (nginx) for SSL/caching
4. Monitor with tools like PM2

## 🧪 Testing

### Manual Testing

1. Navigate to http://localhost:8000

2. Upload a sample PDF
3. Ask questions about the content
4. Check responses are accurate

### Testing the Widget

Embed the generated code on a test HTML page:

```html
<html>
<body>
    <h1>My Website</h1>
    
    <script src="http://localhost:8000/static/chat-widget.js"></script>
    <script>
        initChatWidget("chatbot-id-here", "http://localhost:8000");
    </script>
</body>
</html>
```

## 📊 Performance Tips

1. **Use Claude 3 Haiku**: Fast and cost-effective (already configured)
2. **PDF Optimization**: Limit PDF size to 20-50 MB
3. **Token Management**: System prompt is optimized for efficiency
4. **Caching**: Consider caching frequent questions
5. **Async Processing**: Use background tasks for large PDFs

## 🐛 Troubleshooting

### "Chatbot not found"

- Ensure chatbot_id is correct
- Chatbots are stored in memory - restart clears them
- Check browser console for errors

### "API Error"

- Verify API key is set correctly
- Check Anthropic dashboard for quota limits
- Ensure internet connection

### "PDF Upload Failed"

- Only PDF files allowed (.pdf extension)
- File must be at least 50 characters of text
- Maximum 180k characters processed

### Widget Not Showing

- Check that `chat-widget.js` is loaded
- Verify `initChatWidget()` called with correct parameters
- Check browser console for JavaScript errors

## 🤝 Contributing

To extend this project:

1. **New Chat Features**: Edit `static/chatbot.js`
2. **Backend Enhancements**: Modify `main.py`
3. **Styling Updates**: Update `static/chatbot.css` and `static/style.css`
4. **New AI Models**: Swap Anthropic for OpenAI, Cohere, etc.

## 📚 Dependencies

- **fastapi**: Web framework
- **uvicorn**: ASGI server
- **PyPDF2**: PDF text extraction
- **anthropic**: Claude AI API client
- **python-multipart**: Form file handling
- **python-dotenv**: Environment variables

## 📄 License

MIT License - Feel free to use and modify!

## 🙋 Support

For issues or questions:

1. Check the Troubleshooting section
2. Review browser console for errors
3. Check FastAPI server logs
4. Verify API key and permissions

---

Built with ❤️ using FastAPI + Claude AI
