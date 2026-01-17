(function() {
  // Nimbus Messenger Widget v1.0
  // Embeddable chat widget for customer support

  const WIDGET_ID = 'nimbus-messenger-widget';
  const BUBBLE_ID = 'nimbus-bubble';
  const WINDOW_ID = 'nimbus-window';

  // Get configuration from script tag
  function getConfig() {
    const script = document.currentScript ||
                   Array.from(document.scripts).find(s => s.src.includes('widget.js'));

    return {
      businessId: script?.dataset.business || null,
      origin: script?.src?.split('/widget.js')[0] || window.location.origin,
    };
  }

  const config = getConfig();

  // Create CSS styles
  function injectStyles() {
    if (document.getElementById('nimbus-widget-styles')) return;

    const style = document.createElement('style');
    style.id = 'nimbus-widget-styles';
    style.textContent = `
      #${WIDGET_ID} * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      #${BUBBLE_ID} {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        z-index: 999998;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      }

      #${BUBBLE_ID}:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
      }

      #${BUBBLE_ID}.open {
        opacity: 0;
        pointer-events: none;
      }

      #${WINDOW_ID} {
        position: fixed;
        bottom: 80px;
        right: 20px;
        width: 380px;
        height: 600px;
        border-radius: 12px;
        background: white;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        display: flex;
        flex-direction: column;
        z-index: 999999;
        opacity: 0;
        pointer-events: none;
        transition: all 0.3s ease;
        transform: translateY(20px) scale(0.95);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      }

      #${WINDOW_ID}.open {
        opacity: 1;
        pointer-events: auto;
        transform: translateY(0) scale(1);
      }

      #${WINDOW_ID}-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        border-radius: 12px 12px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      #${WINDOW_ID}-header h3 {
        font-size: 16px;
        font-weight: 600;
        margin: 0;
      }

      #${WINDOW_ID}-close {
        background: rgba(255, 255, 255, 0.3);
        border: none;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s ease;
      }

      #${WINDOW_ID}-close:hover {
        background: rgba(255, 255, 255, 0.4);
      }

      #${WINDOW_ID}-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      #${WINDOW_ID}-messages::-webkit-scrollbar {
        width: 6px;
      }

      #${WINDOW_ID}-messages::-webkit-scrollbar-track {
        background: transparent;
      }

      #${WINDOW_ID}-messages::-webkit-scrollbar-thumb {
        background: #e0e0e0;
        border-radius: 3px;
      }

      #${WINDOW_ID}-messages::-webkit-scrollbar-thumb:hover {
        background: #d0d0d0;
      }

      .nimbus-message {
        display: flex;
        margin-bottom: 8px;
        animation: slideIn 0.3s ease;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .nimbus-message.user {
        justify-content: flex-end;
      }

      .nimbus-message-content {
        max-width: 80%;
        padding: 10px 14px;
        border-radius: 12px;
        word-wrap: break-word;
        font-size: 14px;
        line-height: 1.4;
      }

      .nimbus-message.assistant .nimbus-message-content {
        background: #f0f0f0;
        color: #333;
        border-radius: 12px 12px 12px 0;
      }

      .nimbus-message.user .nimbus-message-content {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 12px 12px 0 12px;
      }

      #${WINDOW_ID}-input-area {
        padding: 12px;
        border-top: 1px solid #e0e0e0;
        display: flex;
        gap: 8px;
      }

      #${WINDOW_ID}-input {
        flex: 1;
        border: 1px solid #e0e0e0;
        border-radius: 20px;
        padding: 8px 12px;
        font-size: 14px;
        font-family: inherit;
        resize: none;
        max-height: 60px;
      }

      #${WINDOW_ID}-input:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
      }

      #${WINDOW_ID}-send {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        transition: opacity 0.2s ease;
      }

      #${WINDOW_ID}-send:hover:not(:disabled) {
        opacity: 0.9;
      }

      #${WINDOW_ID}-send:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .nimbus-loading {
        display: flex;
        gap: 4px;
        align-items: center;
      }

      .nimbus-loading span {
        width: 6px;
        height: 6px;
        background: #999;
        border-radius: 50%;
        animation: pulse 1.4s ease-in-out infinite;
      }

      .nimbus-loading span:nth-child(2) {
        animation-delay: 0.2s;
      }

      .nimbus-loading span:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes pulse {
        0%, 100% { opacity: 0.4; }
        50% { opacity: 1; }
      }

      @media (max-width: 480px) {
        #${WINDOW_ID} {
          width: calc(100vw - 16px);
          height: calc(100vh - 100px);
          bottom: 60px;
          right: 8px;
          left: 8px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  // Create widget HTML
  function createWidget() {
    if (document.getElementById(WIDGET_ID)) return;

    const widget = document.createElement('div');
    widget.id = WIDGET_ID;

    // Chat Bubble
    const bubble = document.createElement('button');
    bubble.id = BUBBLE_ID;
    bubble.setAttribute('aria-label', 'Open chat');
    bubble.innerHTML = '💬';

    // Chat Window
    const window_ = document.createElement('div');
    window_.id = WINDOW_ID;

    const header = document.createElement('div');
    header.id = `${WINDOW_ID}-header`;
    header.innerHTML = `
      <h3>Nimbus Support</h3>
      <button id="${WINDOW_ID}-close" aria-label="Close chat">✕</button>
    `;

    const messages = document.createElement('div');
    messages.id = `${WINDOW_ID}-messages`;

    const inputArea = document.createElement('div');
    inputArea.id = `${WINDOW_ID}-input-area`;
    inputArea.innerHTML = `
      <textarea id="${WINDOW_ID}-input" placeholder="Ask a question..." rows="1"></textarea>
      <button id="${WINDOW_ID}-send" aria-label="Send message">→</button>
    `;

    window_.appendChild(header);
    window_.appendChild(messages);
    window_.appendChild(inputArea);

    widget.appendChild(bubble);
    widget.appendChild(window_);

    document.body.appendChild(widget);

    // Attach event listeners
    attachEventListeners(bubble, window_, messages);
  }

  // Event listeners
  function attachEventListeners(bubble, window_, messagesContainer) {
    const input = document.getElementById(`${WINDOW_ID}-input`);
    const sendBtn = document.getElementById(`${WINDOW_ID}-send`);
    const closeBtn = document.getElementById(`${WINDOW_ID}-close`);

    let messages = [];

    // Toggle window
    bubble.addEventListener('click', () => {
      window_.classList.toggle('open');
      bubble.classList.toggle('open');
      if (window_.classList.contains('open')) {
        input.focus();
      }
    });

    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      window_.classList.remove('open');
      bubble.classList.remove('open');
    });

    // Auto-resize textarea
    function autoResizeTextarea() {
      input.style.height = 'auto';
      const newHeight = Math.min(input.scrollHeight, 60);
      input.style.height = newHeight + 'px';
    }

    input.addEventListener('input', autoResizeTextarea);

    // Send message on Enter (Shift+Enter for newline)
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    sendBtn.addEventListener('click', sendMessage);

    // Send message function
    async function sendMessage() {
      const text = input.value.trim();
      if (!text || sendBtn.disabled) return;

      // Add user message to UI
      messages.push({ role: 'user', content: text });
      addMessageToDOM(messagesContainer, 'user', text);
      input.value = '';
      input.style.height = 'auto';
      sendBtn.disabled = true;

      try {
        // Send to API
        const response = await fetch(`${config.origin}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: messages,
            businessId: config.businessId
          })
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        messages.push({ role: 'assistant', content: data.reply });
        addMessageToDOM(messagesContainer, 'assistant', data.reply);
      } catch (error) {
        console.error('Nimbus Widget Error:', error);
        addMessageToDOM(messagesContainer, 'assistant',
          'Sorry, I encountered an error. Please try again.');
      } finally {
        sendBtn.disabled = false;
        input.focus();
      }
    }
  }

  // Add message to DOM
  function addMessageToDOM(container, role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `nimbus-message ${role}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'nimbus-message-content';
    contentDiv.textContent = content;

    messageDiv.appendChild(contentDiv);
    container.appendChild(messageDiv);

    // Scroll to bottom
    setTimeout(() => {
      container.scrollTop = container.scrollHeight;
    }, 0);
  }

  // Initialize widget when DOM is ready
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    injectStyles();
    createWidget();
  }

  init();
})();
