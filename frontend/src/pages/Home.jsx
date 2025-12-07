import React from 'react'

const Home = () => {
  return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
            <h1 className="text-5xl font-bold text-blue-500 mb-4">Welcome to ChatBot!</h1>
            <p className="text-xl text-gray-400 mb-8">You are securely logged in.</p>
            
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 max-w-md text-center">
                <p className="mb-4">This is a protected route. You can only see this if your JWT token is valid.</p>
                <a href="/logout" className="inline-block px-6 py-2 bg-red-600 rounded hover:bg-red-500 transition">Logout</a>
            </div>
        </div>
    );
}

export default Home