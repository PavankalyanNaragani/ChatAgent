import { useState, useContext, createContext, use, useEffect } from 'react'

// Create the context
const AuthContext = createContext();

const AuthProvider = ({children}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem('accessToken')
  )
  
  
  const logout = () =>{
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = '/login';
  }
  

  return (
    <AuthContext.Provider value={{isLoggedIn, setIsLoggedIn, logout}}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
export {AuthContext};