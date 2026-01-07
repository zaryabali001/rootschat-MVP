/**
 * RootsChat Chatbot JavaScript
 * Handles all chat interactions, message display, and API communication
 */

class ChatBot {
    constructor(chatbotId) {
        this.chatbotId = chatbotId;
        this.chatWindow = null;
        this.questionInput = null;
        this.sendBtn = null;
        this.isLoading = false;
        this.conversationHistory = [];
        this.init();
    }

    init() {
        // Get DOM elements
        this.chatWindow = document.getElementById('chat-window');
        this.questionInput = document.getElementById('question-input');
        this.sendBtn = document.getElementById('send-question');

        // Set up event listeners
        this.sendBtn.addEventListener('click', () => this.sendQuestion());
        this.questionInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendQuestion();
            }
        });

        // Auto-focus input
        this.questionInput.focus();

        // Add welcome message
        this.addBotMessage("👋 Hello! I'm RootsChat, your AI assistant. Ask me anything about the PDF you uploaded!");
    }

    /**
     * Add a message bubble to the chat window
     */
    addMessageBubble(text, type = 'bot', isTyping = false) {
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${type}`;

        if (type === 'bot') {
            // Avatar for bot
            const avatar = document.createElement('div');
            avatar.className = 'bot-avatar';
            avatar.textContent = '🤖';

            const messageContent = document.createElement('div');
            messageContent.className = 'message-content';

            if (isTyping) {
                messageContent.innerHTML = `
                    <div class="typing-indicator">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                `;
            } else {
                messageContent.innerHTML = this.formatMessage(text);
            }

            bubble.appendChild(avatar);
            bubble.appendChild(messageContent);
        } else {
            // User message
            const messageContent = document.createElement('div');
            messageContent.className = 'message-content';
            messageContent.textContent = text;
            bubble.appendChild(messageContent);
        }

        this.chatWindow.appendChild(bubble);
        this.scrollToBottom();
        return bubble;
    }

    /**
     * Format message with markdown-like support
     */
    formatMessage(text) {
        // Escape HTML
        text = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Convert URLs to links
        text = text.replace(
            /https?:\/\/[^\s]+/g,
            (url) => `<a href="${url}" target="_blank" rel="noopener">${url}</a>`
        );

        // Bold **text** -> <strong>text</strong>
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Italic *text* -> <em>text</em>
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Line breaks
        text = text.replace(/\n/g, '<br>');

        return text;
    }

    /**
     * Add bot message
     */
    addBotMessage(text) {
        this.addMessageBubble(text, 'bot', false);
    }

    /**
     * Add user message
     */
    addUserMessage(text) {
        this.addMessageBubble(text, 'user', false);
    }

    /**
     * Show typing indicator
     */
    showTypingIndicator() {
        return this.addMessageBubble('', 'bot', true);
    }

    /**
     * Send question to the chatbot
     */
    async sendQuestion() {
        const question = this.questionInput.value.trim();

        // Validation
        if (!question) {
            return;
        }

        if (this.isLoading) {
            return;
        }

        // Disable input while processing
        this.isLoading = true;
        this.sendBtn.disabled = true;

        // Add user message
        this.addUserMessage(question);
        this.questionInput.value = '';

        // Store in history
        this.conversationHistory.push({
            role: 'user',
            content: question
        });

        // Show typing indicator
        const typingBubble = this.showTypingIndicator();

        try {
            // Send to backend
            const response = await fetch('/ask_question', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    'chatbot_id': this.chatbotId,
                    'question': question
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Remove typing indicator
            typingBubble.remove();

            // Add bot response
            if (data.answer) {
                this.addBotMessage(data.answer);
                this.conversationHistory.push({
                    role: 'bot',
                    content: data.answer
                });
            } else {
                this.addBotMessage('❌ No response received. Please try again.');
            }
        } catch (error) {
            // Remove typing indicator
            typingBubble.remove();

            console.error('Error:', error);
            this.addBotMessage('⚠️ Sorry, I encountered an error. Please check if the server is running and try again.');
        } finally {
            // Re-enable input
            this.isLoading = false;
            this.sendBtn.disabled = false;
            this.questionInput.focus();
        }
    }

    /**
     * Scroll chat to bottom
     */
    scrollToBottom() {
        setTimeout(() => {
            this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
        }, 0);
    }

    /**
     * Clear chat history
     */
    clearChat() {
        this.chatWindow.innerHTML = '';
        this.conversationHistory = [];
        this.addBotMessage("👋 Chat cleared! Ask me anything about the PDF.");
    }

    /**
     * Export chat as text
     */
    exportChat() {
        let text = 'RootsChat Conversation\n';
        text += '=====================\n\n';

        this.conversationHistory.forEach((msg) => {
            const role = msg.role === 'user' ? 'You' : 'RootsChat';
            text += `${role}:\n${msg.content}\n\n`;
        });

        return text;
    }
}

// Initialize chatbot when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (window.chatbotId) {
        window.chatBot = new ChatBot(window.chatbotId);
    }
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    // Optional: Save chat history to localStorage
    if (window.chatBot) {
        localStorage.setItem(`chat_${window.chatbotId}`, JSON.stringify(window.chatBot.conversationHistory));
    }
});
