import { MessageSquare, Settings } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";
import { AuthContext } from "../AuthProvider";

export default function Sidebar() {
  const { user } = useContext(AuthContext);
  const [recentChats, setRecentChats] = useState([]);

  // Fetch recent sessions from /api/sessions/ endpoint
  useEffect(() => {
    async function fetchSessions() {
      if (!user) return;
      try {
        const res = await axiosInstance.get("/sessions/");
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

        {/* Recent Sessions */}
        <div className="mt-4 text-gray-400 text-sm uppercase tracking-wide">Recent Chats</div>
        <div className="flex flex-col gap-2 text-gray-300">
          {user ? (
            recentChats.length > 0 ? (
              recentChats.map((session) => (
                <a key={session.id} className="py-2 pl-0 hover:bg-gray-800 cursor-pointer transition">
                  {session.title || `Session ${session.id}`}
                </a>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No chats yet</p>
            )
          ) : (
            <p className="text-gray-500 text-sm">Login to see chats</p>
          )}
        </div>
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
