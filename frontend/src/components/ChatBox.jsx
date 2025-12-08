import React from 'react'
import { assets } from '../assets/assets';
import { Send } from "lucide-react";
import { useState } from "react";

const ChatBox = () => {
    const [messages, setMessages] = useState([
        { id: 1, sender: "bot", text: "Hello! How can I help you today?" },
    ]);
 
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: "user",
      text: input,
    };

    setMessages([...messages, newMessage]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gray-950 text-white p-6">
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-lg px-4 py-2 rounded-2xl text-sm shadow-md ${
              msg.sender === "user"
                ? "bg-purple-600 self-end ml-auto"
                : "bg-gray-800 self-start mr-auto"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Input Box */}
      <div className="mt-4 flex items-center gap-3 bg-gray-900 p-3 rounded-2xl border border-gray-800">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-transparent outline-none text-sm"
        />

        <button
          onClick={handleSend}
          className="p-2 rounded-xl bg-purple-600 hover:bg-purple-700 transition"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );  
}

export default ChatBox