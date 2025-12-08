import React from 'react'
import axiosInstance from "../axiosInstance"

const Sessions = () => {
// Function to fetch all chat sessions
    useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await axiosInstance.get("/sessions/");
        console.log(res.data);
        // Map sessions to only include title
      } catch (err) {
        console.error("Failed to load sessions", err);
      }
    }
    fetchSessions();
  }, []);

  return (
    <div>Sessions</div>
  )
}

export default Sessions