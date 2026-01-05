function initChatWidget(chatbotId, serverUrl) {
    // Clean server URL
    if (serverUrl.endsWith('/')) {
        serverUrl = serverUrl.slice(0, -1);
    }

    // Create main widget container
    const widget = document.createElement('div');
    widget.id = 'rootschat-widget';
    widget.innerHTML = `
        <!-- Floating Toggle Button -->
        <div id="rootschat-toggle" class="rootschat-toggle">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4v3.5l5.5-3.5H20c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
        </div>

        <!-- Chat Popup Window -->
        <div id="rootschat-window" class="rootschat-window hidden">
            <div class="rootschat-header">
                <div class="header-info">
                    <div class="title">RootsChat</div>
                    <div class="subtitle">Ask me anything about this document</div>
                </div>
                <button id="rootschat-close" class="close-btn">✕</button>
            </div>
            <iframe src="${serverUrl}/chat/${chatbotId}" frameborder="0"></iframe>
        </div>
    `;

    document.body.appendChild(widget);

    // Elements
    const toggleBtn = widget.querySelector('#rootschat-toggle');
    const chatWindow = widget.querySelector('#rootschat-window');
    const closeBtn = widget.querySelector('#rootschat-close');

    // Open chat when clicking toggle
    toggleBtn.addEventListener('click', () => {
        chatWindow.classList.remove('hidden');
        toggleBtn.style.display = 'none';
    });

    // Close chat when clicking X
    closeBtn.addEventListener('click', () => {
        chatWindow.classList.add('hidden');
        toggleBtn.style.display = 'flex';
    });

    // Optional: Auto-open after 3 seconds (remove if not wanted)
    // setTimeout(() => toggleBtn.click(), 3000);
}