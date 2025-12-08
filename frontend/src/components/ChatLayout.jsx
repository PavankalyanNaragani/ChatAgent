import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatBox from "../components/ChatBox";
import axiosInstance from "../axiosInstance"; // Import Axios

export default function ChatLayout() {
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [refreshSidebar, setRefreshSidebar] = useState(0);

  // --- CHANGED LOGIC HERE ---
  const handleNewChat = async () => {
    try {
      // 1. Create the session immediately in the DB
      const res = await axiosInstance.post("/sessions/", { 
        session_name: "New Chat" 
      });
      
      // 2. Select the new ID immediately
      setSelectedSessionId(res.data.id);
      
      // 3. Refresh sidebar to show the new item
      setRefreshSidebar(prev => prev + 1);
      
    } catch (err) {
      console.error("Failed to create new chat:", err);
    }
  };
  // -------------------------

  return (
    <div className="flex h-screen w-full bg-gray-950">
      <Sidebar 
        onSelectSession={setSelectedSessionId} 
        onNewChat={handleNewChat} // Passes the async function
        activeSessionId={selectedSessionId}
        refreshTrigger={refreshSidebar} 
      />

      <div className="flex-1 flex flex-col relative">
        <ChatBox 
          key={selectedSessionId} 
          sessionId={selectedSessionId}
          setSessionId={setSelectedSessionId}
          onTitleUpdate={() => setRefreshSidebar(prev => prev + 1)}
        />
      </div>
    </div>
  );
}