import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react"; // Install lucide-react if needed
import axiosInstance from "../axiosInstance";

export default function ChatBox({ sessionId, setSessionId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!sessionId) {
      setMessages([]); // Clear screen for "New Chat"
      return;
    }

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

  // 2. AUTO-SCROLL: Runs whenever 'messages' change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  // 3. SEND MESSAGE LOGIC
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // A. Optimistic Update (Show user message immediately)
    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    
    const currentMessage = input;
    setInput(""); // Clear input
    setIsSending(true);

    try {
      let activeId = sessionId;

      // B. If NO Session ID (New Chat Mode), create one first!
      if (!activeId) {
        const createRes = await axiosInstance.post("/sessions/", {
          session_name: currentMessage.substring(0, 30) // Title = first 30 chars
        });
        activeId = createRes.data.id;
        
        // CRITICAL: Tell the Parent (ChatLayout) about the new ID
        // This forces the Sidebar to refresh and highlight the new chat
        setSessionId(activeId); 
      }

      // C. Send the actual message to the AI
      const res = await axiosInstance.post(`/sessions/${activeId}/send/`, {
        content: currentMessage,
      });

      // D. Append AI Response
      const aiMsg = { role: "ai", content: res.data.content };
      setMessages((prev) => [...prev, aiMsg]);

    } catch (err) {
      console.error("Error sending message", err);
      setMessages((prev) => [...prev, { role: "error", content: "Failed to send message. Please try again." }]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100">
      
      {/* HEADER */}
      <div className="p-4 border-b border-gray-800 flex items-center gap-2 bg-gray-900 z-10">
        <Bot className="text-purple-500" size={24} />
        <h2 className="font-semibold text-lg">
           {sessionId ? "Chat Session" : "New Conversation"}
        </h2>
      </div>

      {/* MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-800">
        
        {/* Welcome Screen (Only show if no session and no messages) */}
        {!sessionId && messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
            <Bot size={64} className="mb-4" />
            <p className="text-xl font-medium">How can I help you today?</p>
          </div>
        )}

        {/* Loading History Spinner */}
        {loading && (
            <div className="flex justify-center mt-10">
                <Loader2 className="animate-spin text-purple-500" />
            </div>
        )}

        {/* Message List */}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            
            {/* AI Avatar */}
            {msg.role === "ai" && (
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center shrink-0 border border-gray-700">
                <Bot size={16} className="text-purple-400" />
              </div>
            )}

            {/* Bubble */}
            <div className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-md ${
              msg.role === "user" 
                ? "bg-purple-600 text-white rounded-br-none" 
                : "bg-gray-800 text-gray-200 border border-gray-700 rounded-bl-none"
            }`}>
              {msg.content}
            </div>

            {/* User Avatar */}
            {msg.role === "user" && (
               <div className="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center shrink-0 border border-purple-500/30">
                 <User size={16} className="text-purple-200" />
               </div>
            )}
          </div>
        ))}
        
        {/* AI Typing Indicator */}
        {isSending && (
           <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
                  <Bot size={16} className="text-purple-400" />
              </div>
              <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-none border border-gray-700 flex items-center gap-1">
                 <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                 <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></span>
                 <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></span>
              </div>
           </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="p-4 bg-gray-900 border-t border-gray-800">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-center gap-2">
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
            className="p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
          >
            {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </form>
        <p className="text-center text-xs text-gray-600 mt-2">
          AI generated content may be inaccurate.
        </p>
      </div>
    </div>
  );
}