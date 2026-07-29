import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { loginUser, registerUser } from '../services/authService';
import { setAuthToken } from '../services/api';

// ─── Context Creation ──────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ─── Provider Component ────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  // Core auth state — stored in React state only (no localStorage for now)
  const [user, setUser] = useState(null);   // { id, name, email, role }
  const [token, setToken] = useState(null); // JWT string

  // Keep the API interceptor token in sync with React state
  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  // ── Derived helpers ──────────────────────────────────────────────────────────
  const isAuthenticated = !!token;
  const userRole = user?.role ?? null; // 'customer' | 'provider' | null

  // ── login ────────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const data = await loginUser(email, password);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  // ── register ─────────────────────────────────────────────────────────────────
  const register = useCallback(async (name, email, password, role) => {
    const data = await registerUser(name, email, password, role);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  // ── logout ───────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated,
    userRole,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Custom Hook ───────────────────────────────────────────────────────────────
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return context;
}

export default AuthContext;
