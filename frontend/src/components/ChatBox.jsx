import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Loader2, Paperclip, FileText } from "lucide-react"; 
import axiosInstance from "../axiosInstance";
import MessageContent from "./MessageContent";


export default function ChatBox({ sessionId, setSessionId, onTitleUpdate }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // RAG States
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // 1. Fetch History (SIMPLIFIED)
  useEffect(() => {
    // If we somehow don't have an ID, do nothing (shouldn't happen now)
    if (!sessionId) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/sessions/${sessionId}/messages/`);
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [sessionId]);

  // 2. Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  // 3. Handle File Upload
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file || !sessionId) return; // Guard clause

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await axiosInstance.post(`/sessions/${sessionId}/upload/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessages(prev => [...prev, { role: "system", content: `📄 Uploaded: ${file.name}` }]);
    } catch (err) {
      alert("Failed to upload file.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; 
    }
  };

  // 4. Send Message (SIMPLIFIED)
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !sessionId) return;

    // UI Optimistic Update
    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    
    const currentMessage = input;
    setInput("");
    setIsSending(true);

    try {
      // --- NO MORE SESSION CREATION LOGIC HERE ---
      // We just send to the existing sessionId
      const res = await axiosInstance.post(`/sessions/${sessionId}/send/`, {
        content: currentMessage,
      });

      // Check if title updated
      if (res.data.session_name && onTitleUpdate) {
         onTitleUpdate();
      }

      const aiMsg = { role: "ai", content: res.data.content };
      setMessages((prev) => [...prev, aiMsg]);

    } catch (err) {
      console.error("Error sending message", err);
      setMessages((prev) => [...prev, { role: "error", content: "Failed to send message." }]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100">
      
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center gap-2 bg-gray-900 z-10">
        <Bot className="text-purple-500" size={24} />
        <h2 className="font-semibold text-lg">Chat Session</h2>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-800">
        
        {loading && (
            <div className="flex justify-center mt-10">
                <Loader2 className="animate-spin text-purple-500" />
            </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
             
             {msg.role === "system" ? (
                <div className="w-full flex justify-center my-2">
                    <span className="bg-gray-800 text-gray-400 text-xs px-3 py-1 rounded-full flex items-center gap-2 border border-gray-700">
                        <FileText size={12} /> {msg.content}
                    </span>
                </div>
             ) : (
                <>
                  {msg.role === "ai" && (
                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center shrink-0 border border-gray-700">
                      <Bot size={16} className="text-purple-400" />
                    </div>
                  )}

                  <div className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-md ${
                    msg.role === "user" 
                    ? "bg-purple-600 text-white rounded-br-none" 
                    : "bg-gray-800 text-gray-200 border border-gray-700 rounded-bl-none overflow-hidden" // Added overflow-hidden for code blocks
                    }`}>
                   <MessageContent content={msg.content} />
                  </div>
                </>
             )}
          </div>
        ))}
        
        {isSending && (
           <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
                  <Bot size={16} className="text-purple-400" />
              </div>
              <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-none border border-gray-700">
                 <span className="text-xs text-gray-400 animate-pulse">Thinking...</span>
              </div>
           </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-900 border-t border-gray-800">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-center gap-2">
          
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden" 
            accept="application/pdf"
          />

          <button
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-gray-400 hover:text-white transition rounded-xl hover:bg-gray-800"
          >
            {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Paperclip size={20} />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message IntelliChat..."
            className="flex-1 bg-gray-800 text-white border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent placeholder-gray-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition shadow-lg"
          >
            {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </form>
      </div>
    </div>
  );
}