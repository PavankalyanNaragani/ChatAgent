import Sidebar from "./SideBar";
import ChatBox from "./ChatBox";

export default function ChatLayout() {
  return (
    <div className="flex h-screen w-full bg-gray-950">
      {/* Sidebar */}
      <Sidebar />

      {/* Chatbox */}
      <div className="flex-1">
        <ChatBox />
      </div>
    </div>
  );
}
