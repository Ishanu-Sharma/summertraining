import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    const token = localStorage.getItem("quad_token");
    if (!token) { setLoading(false); return; }
    try {
      const { user } = await api.get("/auth/me");
      setUser(user);
    } catch {
      localStorage.removeItem("quad_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMe(); }, [loadMe]);

  async function login(email, password) {
    const { user, token } = await api.post("/auth/login", { email, password }, { auth: false });
    localStorage.setItem("quad_token", token);
    setUser(user);
    return user;
  }

  async function register(data) {
    const { user, token } = await api.post("/auth/register", data, { auth: false });
    localStorage.setItem("quad_token", token);
    setUser(user);
    return user;
  }

  function logout() {
    localStorage.removeItem("quad_token");
    setUser(null);
  }

  function updateLocalUser(patch) {
    setUser(prev => (prev ? { ...prev, ...patch } : prev));
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateLocalUser, refresh: loadMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
