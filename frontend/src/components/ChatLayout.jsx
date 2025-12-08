import Sidebar from "./SideBar";
import ChatBox from "./ChatBox";
import { useState } from "react";

export default function ChatLayout() {
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  
  const handleNewChat = ()=> {
    setSelectedSessionId(null);
  }

  return (
    <div className="flex h-screen w-full bg-gray-950">
      {/* Sidebar */}
      <Sidebar  
        onSelectSession={setSelectedSessionId} 
        onNewChat={handleNewChat}
        activeSessionId={selectedSessionId}
      />

      {/* Chatbox */}
      <div className="flex-1 flex flex-col relative">
        <ChatBox
          key={selectedSessionId} 
          sessionId={selectedSessionId}
          setSessionId={setSelectedSessionId}
        />
      </div>
    </div>
  );
}
