import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AuthProvider from './AuthProvider'
import ChatLayout from "./components/ChatLayout";
import PrivateRoute from './PrivateRoute'
import PublicRoute from './PublicRoute'



function App() {
  return (
    <>
    <AuthProvider>
      <BrowserRouter >
        <Routes>
           <Route path='/register' element={<PublicRoute><Register /></PublicRoute>} />
          <Route path='/login' element={<PublicRoute><Login /></PublicRoute>} />
          <Route path='/' element={<PrivateRoute><ChatLayout /></PrivateRoute>} />          
        </Routes>
      </BrowserRouter>
    </AuthProvider>
      
    </>
  );
}

export default App;