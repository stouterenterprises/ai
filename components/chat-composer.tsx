"use client";

import { useState } from "react";

interface ChatComposerProps {
  departmentId?: string;
}

export default function ChatComposer({ departmentId }: ChatComposerProps) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const nextMessages = [...messages, { role: "user", content: input }];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: nextMessages,
        departmentId: departmentId || undefined
      })
    });

    const payload = await response.json();
    setMessages([...nextMessages, { role: "assistant", content: payload.reply }]);
    setIsLoading(false);
  };

  return (
    <div>
      <div className="list" style={{ marginTop: 16 }}>
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className="card">
            <strong>{message.role === "user" ? "You" : "Nimbus AI"}</strong>
            <p>{message.content}</p>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16 }}>
        <textarea
          rows={3}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask a question about billing, setup, or policies"
        />
        <button onClick={sendMessage} disabled={isLoading}>
          {isLoading ? "Thinking..." : "Send"}
        </button>
      </div>
    </div>
  );
}
