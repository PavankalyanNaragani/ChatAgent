import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Register from "./pages/Register";
import AuthProvider from './AuthProvider'



function App() {
  return (
    <>
    <AuthProvider>
      <BrowserRouter >
        <Routes>
          <Route path='/register' element={<Register />} />
          <Route path='/login' element={<Login /> }/>
          <Route path='/' element={<Home />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
      
    </>
  );
}

export default App;