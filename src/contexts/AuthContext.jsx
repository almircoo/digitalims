import React, { createContext, useState, useContext, useEffect } from 'react'
import { login as loginApi, register as registerApi } from '@/apis'

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(false);

  const signIn = async (email, password, callback) => {
    setLoading(true);
    const response = await loginApi(email, password);
    console.log("response", response);

    if (response && response.auth_token) {
      localStorage.setItem("token", response.auth_token);
      setToken(response.auth_token);

      callback();
    }

    setLoading(false);
  }

  const signOut = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
  }

  const register = async (userData, callback) => {
    setLoading(true);
    const response = await registerApi(userData);
    if (response && response.id) {
      callback();
    }
    setLoading(false);
  }

  const value = {
    token,
    loading,
    signIn,
    signOut,
    register,
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth=()=>{
  const context = useContext(AuthContext)
  if (!context){
    throw new Error("useAuth debe usarse dentro de AuthProvider")
  }
  return context
}
export default AuthContext;
