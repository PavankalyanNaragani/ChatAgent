import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  // Base URL (Adjust if your api is at /api/v1/ etc)
  const API_BASE = 'http://127.0.0.1:8000/api';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  };

  // 1. Load History when Session ID changes
  useEffect(() => {
    if (!sessionId) return;

    const fetchHistory = async () => {
      try {
        // MATCHES: path('sessions/<int:session_id>/messages/', ...)
        const res = await axios.get(`${API_BASE}/sessions/${sessionId}/messages/`, getAuthHeaders());
        setMessages(res.data); // Assuming backend returns list of messages directly
      } catch (error) {
        console.error("Failed to load history:", error);
      }
    };

    fetchHistory();
  }, [sessionId]);

  // 2. Initial Check for Active Session
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        // MATCHES: path('sessions/', ...)
        const res = await axios.get(`${API_BASE}/sessions/`, getAuthHeaders());
        if (res.data && res.data.length > 0) {
          setSessionId(res.data[0].id); // Load the most recent chat
        }
      } catch (error) {
        console.log("No sessions found");
      }
    };
    fetchSessions();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    // UI Update (Optimistic)
    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      let currentSessionId = sessionId;

      // Create Session if none exists
      if (!currentSessionId) {
        const createRes = await axios.post(
          `${API_BASE}/sessions/`, 
          { session_name: "New Chat" }, 
          getAuthHeaders()
        );
        currentSessionId = createRes.data.id;
        setSessionId(currentSessionId);
      }

      // MATCHES: path('sessions/<int:session_id>/send/', ...)
      const response = await axios.post(
        `${API_BASE}/sessions/${currentSessionId}/send/`, 
        { content: input }, 
        getAuthHeaders()
      );

      // Add AI Response
      const aiMessage = { role: 'ai', content: response.data.content };
      setMessages((prev) => [...prev, aiMessage]);

    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [...prev, { role: 'error', content: 'Failed to send message.' }]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ padding: '10px', borderBottom: '1px solid #ccc', marginBottom: '10px' }}>
        <h3>💬 Chat Session: {sessionId || 'New'}</h3>
      </div>

      {/* Chat Window */}
      <div style={{ 
        height: '400px', 
        overflowY: 'auto', 
        border: '1px solid #eee', 
        padding: '15px', 
        backgroundColor: '#f9f9f9' 
      }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: '10px'
          }}>
            <div style={{ 
              maxWidth: '70%',
              padding: '10px 15px',
              borderRadius: '15px',
              backgroundColor: msg.role === 'user' ? '#007bff' : '#ffffff',
              color: msg.role === 'user' ? '#fff' : '#333',
              border: msg.role === 'ai' ? '1px solid #ddd' : 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && <p style={{color: '#888', fontStyle: 'italic'}}>AI is thinking...</p>}
      </div>

      {/* Input Area */}
      <div style={{ display: 'flex', marginTop: '10px', gap: '10px' }}>
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
          style={{ flex: 1, padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <button 
          onClick={sendMessage} 
          style={{ 
            padding: '10px 25px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer' 
          }}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;