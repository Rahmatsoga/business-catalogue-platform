import { createContext, useContext, useEffect, useState, useCallback } from "react";
import apiClient from "../api/axiosClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // On first load, ask the server "am I still logged in?" using the httpOnly cookie
  const checkSession = useCallback(async () => {
    try {
      const response = await apiClient.get("/auth/me");
      setAdmin(response.data.data);
    } catch {
      setAdmin(null);
    } finally {
      setCheckingSession(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (email, password) => {
    const response = await apiClient.post("/auth/login", { email, password });
    setAdmin(response.data.data);
    return response.data;
  };

  const logout = async () => {
    await apiClient.post("/auth/logout");
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, checkingSession, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
