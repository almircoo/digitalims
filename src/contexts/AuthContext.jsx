import React from "react";
import { createContext, useState, useContext, useEffect } from "react";
import { login as loginApi, register as registerApi } from "@/apis";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token"),
  );

  useEffect(() => {
    if (token) {
      try {
        const storedRole = localStorage.getItem("userRole");
        const storedUser = localStorage.getItem("userData");

        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser({
            ...userData,
            role: storedRole || "USER",
          });
        } else {
          // Fallback: parse from token if no stored data
          const parts = token.split(".");
          if (parts.length !== 3) {
            throw new Error("Token inválido: no es un JWT válido");
          }

          const payload = JSON.parse(atob(parts[1]));
          console.log("Token payload:", payload);

          setUser({
            id: payload.sub,
            nombre: payload.email?.split("@")[0] || "Usuario",
            email: payload.email || payload.sub,
            role: storedRole || "USER",
          });
        }
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing token:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userData");
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    setLoading(false);
  }, [token]);

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const response = await loginApi(email, password);

      if (response && response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("userRole", response.role || "USER");
        localStorage.setItem(
          "userData",
          JSON.stringify({
            id: response.id,
            email: response.email,
            nombre: response.email?.split("@")[0] || "Usuario",
          }),
        );

        setToken(response.token);
        return { success: true };
      } else {
        return { success: false, error: "Credenciales inválidas" };
      }
    } catch (error) {
      return { success: false, error: error.message || "Error en login" };
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userData");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const logout = signOut;

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
        error: error.message || "Error en el registro",
      };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    token,
    user,
    loading,
    isAuthenticated,
    signIn,
    signOut,
    logout,
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
