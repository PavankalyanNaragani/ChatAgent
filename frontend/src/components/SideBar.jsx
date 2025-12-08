import { MessageSquare, PlusCircle, LogOut } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";
import { AuthContext } from "../AuthProvider";

export default function Sidebar({ onSelectSession, onNewChat, activeSessionId, refreshTrigger }) {
  const { user, logout } = useContext(AuthContext);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch recent sessions and display their title
  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await axiosInstance.get("/sessions/");
        console.log(res.data)
        setSessions(res.data);

        if (activeSessionId === null) {
          if (res.data.length > 0) {
            // Automatically select the most recent chat
            onSelectSession(res.data[0].id);
          } else {
            // If no chats exist, start a new one automatically
            onNewChat();
          }
        }
      } catch (err) {
        console.error("Failed to load sessions", err);
      }finally{
        setLoading(false);
      }
    }
    fetchSessions();
  }, [user, activeSessionId, refreshTrigger]);

  return (
    <div className="h-screen w-64 bg-gray-900 text-white flex flex-col p-4 border-r border-gray-800">
      {/* --- HEADER & NEW CHAT --- */}
      <div className="p-4">
        <div className="text-xl font-bold mb-6 flex items-center gap-2 tracking-wide">
          <span className="text-purple-500">⚡</span> IntelliChat
        </div>

        <button 
          onClick={onNewChat} 
          className="w-full flex items-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm font-medium shadow-md"
        >
          <PlusCircle size={18} />
          New Chat
        </button>
      </div>

      {/* --- SESSION LIST (SCROLLABLE) --- */}
      <div className="flex-1 overflow-y-auto px-2 scrollbar-thin scrollbar-thumb-gray-700">
        <div className="text-xs font-semibold text-gray-500 mb-2 px-2 uppercase tracking-wider">
          Recent
        </div>
        
        <div className="space-y-1">
          {loading ? (
             <p className="text-gray-500 text-sm px-4">Loading...</p>
          ) : sessions.length > 0 ? (
            sessions.map((session) => (
              <button
                key={session.id}
                
                // 4. Wire up Selection Logic
                onClick={() => onSelectSession(session.id)} 
                
                // 5. Active State Styling
                className={`w-full text-left px-3 py-3 rounded-lg text-sm flex items-center gap-3 transition-colors ${
                  activeSessionId === session.id 
                    ? "bg-gray-800 text-white border-l-4 border-purple-500" // Active Style
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"   // Inactive Style
                }`}
              >
                <MessageSquare size={16} className="shrink-0" />
                <span className="truncate">
                  {session.title || `Chat #${session.id}`}
                </span>
              </button>
            ))
          ) : (
            <div className="text-gray-500 text-sm px-4 py-2 italic">
              No chats yet.
            </div>
          )}
        </div>
      </div>
      
      {/* User */}
      <div className="mt-auto flex flex-col gap-3 py-2">
       
            <button
              onClick={logout}
              className="flex items-center gap-2 text-red-400 hover:text-red-300 transition text-sm"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
      </div>
       
      {/* Footer */}
      <div className="mt-2 text-sm text-gray-500">© 2025 IntelliChat</div>
    </div>
  );
}
