// === NEW: Landing Page Navigation ===
document.getElementById('get-started-btn')?.addEventListener('click', () => {
    document.getElementById('landing-page').classList.remove('active');
    document.getElementById('builder-page').classList.add('active');
});

document.getElementById('back-to-landing')?.addEventListener('click', () => {
    document.getElementById('builder-page').classList.remove('active');
    document.getElementById('landing-page').classList.add('active');
    
    // Optional: Reset builder page when going back
    document.getElementById('embed-section')?.classList.add('hidden');
    document.getElementById('upload-section')?.classList.remove('hidden');
    if (document.getElementById('pdf-upload')) {
        document.getElementById('pdf-upload').value = '';
    }
});

// === ORIGINAL CHATBOT CREATION LOGIC (UNCHANGED) ===
if (document.getElementById('create-chatbot')) {
    document.getElementById('create-chatbot').addEventListener('click', async () => {
        const fileInput = document.getElementById('pdf-upload');
        if (!fileInput.files.length) {
            alert('Please select a PDF file first');
            return;
        }

        const formData = new FormData();
        formData.append('file', fileInput.files[0]);

        try {
            const response = await fetch('/create_chatbot', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.detail || 'Error creating chatbot');
                return;
            }

            // Show embed section
            document.getElementById('upload-section').classList.add('hidden');
            document.getElementById('embed-section').classList.remove('hidden');
            document.getElementById('embed-code').textContent = data.embed_code;

            // Store chatbot ID for testing
            window.currentChatbotId = data.chatbot_id;

        } catch (err) {
            alert('Network error. Please check if the server is running.');
        }
    });

    // Test the created chatbot
    document.getElementById('test-chatbot')?.addEventListener('click', () => {
        if (window.currentChatbotId) {
            window.open(`/chat/${window.currentChatbotId}`, '_blank');
        }
    });

    // Create a new chatbot
    document.getElementById('new-chatbot')?.addEventListener('click', () => {
        document.getElementById('embed-section').classList.add('hidden');
        document.getElementById('upload-section').classList.remove('hidden');
        document.getElementById('pdf-upload').value = '';
    });
}

// === EMBEDDED CHAT WIDGET LOGIC (UNCHANGED) ===
if (document.getElementById('send-question') && window.chatbotId) {
    const chatWindow = document.getElementById('chat-window');
    const input = document.getElementById('question-input');

    function addBubble(text, type) {
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${type}-bubble`;
        bubble.textContent = text;
        chatWindow.appendChild(bubble);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    // Initial greeting (optional - already in HTML, but safe)
    // addBubble("Hello! I'm powered by Claude AI. Ask me anything about the PDF! 📄", 'bot');

    document.getElementById('send-question').addEventListener('click', sendQuestion);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendQuestion();
        }
    });

    async function sendQuestion() {
        const question = input.value.trim();
        if (!question) return;

        addBubble(question, 'user');
        input.value = '';

        const formData = new URLSearchParams();
        formData.append('chatbot_id', window.chatbotId);
        formData.append('question', question);

        try {
            const res = await fetch('/ask_question', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData
            });

            const data = await res.json();
            addBubble(data.answer, 'bot');
        } catch (err) {
            addBubble('Error: Could not connect to the server.', 'bot');
        }
    }
}