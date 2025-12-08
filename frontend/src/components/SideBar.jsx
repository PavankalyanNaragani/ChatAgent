import { MessageSquare, Settings } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";
import { AuthContext } from "../AuthProvider";

export default function Sidebar() {
  const { user } = useContext(AuthContext);
  const [recentChats, setRecentChats] = useState([]);

  // Fetch recent sessions and display their title
  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await axiosInstance.get("/sessions/");
        console.log(res.data)
        setRecentChats(res.data);
      } catch (err) {
        console.error("Failed to load sessions", err);
      }
    }
    fetchSessions();
  }, [user]);

  return (
    <div className="h-screen w-64 bg-gray-900 text-white flex flex-col p-4 border-r border-gray-800">
      {/* Logo */}
      <div className="text-2xl font-bold mb-8 tracking-wide">IntelliChat</div>

      {/* Nav Items */}
      <nav className="flex flex-col gap-4 text-gray-300">
        {/* New Chat */}
        <a className="flex items-center gap-3 py-2 pl-0 hover:bg-gray-800 cursor-pointer transition">
          <MessageSquare size={22} />
          <span>New Chat</span>
        </a>

        {/* --- THIS IS THE PART THAT RENDERS YOUR ARRAY --- */}
      <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700">
        <div className="text-gray-500 text-xs uppercase tracking-wide mb-2 font-semibold">Recent Chats</div>
        
        <div className="flex flex-col gap-1">
          {recentChats.map((session) => (
            <div className="flex items-center gap-3 py-2 pl-0 hover:bg-gray-800 cursor-pointer transition">
              <MessageSquare size={16} className="shrink-0" />
              <span className="truncate">
                {session.title} 
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* ----------------------------------------------- */}
      </nav>

      {/* User */}
      <div className="mt-auto flex items-center gap-3 py-2 pl-0 hover:bg-gray-800 cursor-pointer transition">
        <Settings size={22} />
        <span>{user?.username || "Guest"}</span>
      </div>

      {/* Footer */}
      <div className="mt-2 text-sm text-gray-500">© 2025 IntelliChat</div>
    </div>
  );
}
