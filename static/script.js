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

// === ORIGINAL CHATBOT CREATION LOGIC (UPDATED FOR NEW CHAT INTERFACE) ===
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

    // Test the created chatbot in a new window
    document.getElementById('test-chatbot')?.addEventListener('click', () => {
        if (window.currentChatbotId) {
            window.open(`/chat/${window.currentChatbotId}`, '_blank', 'width=500,height=700');
        }
    });

    // Create a new chatbot
    document.getElementById('new-chatbot')?.addEventListener('click', () => {
        document.getElementById('embed-section').classList.add('hidden');
        document.getElementById('upload-section').classList.remove('hidden');
        document.getElementById('pdf-upload').value = '';
    });
}
