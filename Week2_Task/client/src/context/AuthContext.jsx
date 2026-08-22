import { createContext, useContext, useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  // "checking" means we haven't yet confirmed session status with the server.
  // This prevents flashing the login page before we know the real answer.
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const res = await axiosClient.get("/auth/me");
      setAdmin(res.data.data);
      setStatus("authenticated");
    } catch {
      setAdmin(null);
      setStatus("unauthenticated");
    }
  }

  async function login(email, password) {
    const res = await axiosClient.post("/auth/login", { email, password });
    setAdmin(res.data.data);
    setStatus("authenticated");
  }

  async function logout() {
    await axiosClient.post("/auth/logout");
    setAdmin(null);
    setStatus("unauthenticated");
  }

  return (
    <AuthContext.Provider value={{ admin, status, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");
  return ctx;
}
