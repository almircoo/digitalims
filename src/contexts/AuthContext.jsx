import React, { createContext, useState, useContext, useEffect } from "react";
import { login as loginApi, register as registerApi } from "@/apis";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(false);

  const signIn = async (email, password) => {
    setLoading(true);
    const response = await loginApi(email, password);
    console.log("response", response);

    if (response && response.token) {
      localStorage.setItem("token", response.token);
      setToken(response.token);
    } else {
      return { success: false, erro: "Credenciales invalidas" };
    }

    setLoading(false);
  };

  const signOut = () => {
    localStorage.removeItem("token");
    setToken("");
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await registerApi(userData);

      if (response && response.id) {
        return { success: true, data: response };
      } else {
        return { success: false, error: "Error en el registro" };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Error en el registro",
      };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    token,
    loading,
    signIn,
    signOut,
    register,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
};
export default AuthContext;
