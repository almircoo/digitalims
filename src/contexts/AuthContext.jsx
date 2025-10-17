import { createContext, useState, useContext, useEffect } from "react"
import { login as loginApi, register as registerApi } from "@/apis"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        setUser({
          id: payload.sub,
          nombre: payload.nombre || payload.email,
          email: payload.email,
          role: payload.role || "USER",
        })
      } catch (error) {
        console.error("Error parsing token:", error)
        localStorage.removeItem("token")
        setToken(null)
      }
    }
  }, [token])

  const signIn = async (email, password) => {
    setLoading(true)
    try {
      const response = await loginApi(email, password)

      if (response && response.token) {
        localStorage.setItem("token", response.token)
        setToken(response.token)
        return { success: true }
      } else {
        return { success: false, error: "Credenciales inválidas" }
      }
    } catch (error) {
      return { success: false, error: error.message || "Error en login" }
    } finally {
      setLoading(false)
    }
  }

  const signOut = () => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
  }

  const logout = signOut

  const register = async (userData) => {
    setLoading(true)
    try {
      const response = await registerApi(userData)

      if (response && response.id) {
        return { success: true, data: response }
      } else {
        return { success: false, error: "Error en el registro" }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || "Error en el registro",
      }
    } finally {
      setLoading(false)
    }
  }

  const value = {
    token,
    user,
    loading,
    signIn,
    signOut,
    logout,
    register,
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider")
  }
  return context
}
export default AuthContext
