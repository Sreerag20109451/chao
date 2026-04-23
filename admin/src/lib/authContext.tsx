"use client";

/**
 * authContext.tsx — Admin App
 *
 * Lightweight auth context. Currently backed by localStorage so the session
 * survives a page refresh. Swap out the login/register handlers for real
 * Firebase / API calls when ready.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AdminUser {
  email: string;
  name: string;
}

interface AuthContextValue {
  user: AdminUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("chao_admin_user");
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        // DEFAULT LOGGED IN STATUS: TRUE
        const defaultUser: AdminUser = { email: "admin@chaothai.ie", name: "Sreerag" };
        localStorage.setItem("chao_admin_user", JSON.stringify(defaultUser));
        setUser(defaultUser);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, _password: string) => {
    // TODO: replace with Firebase signInWithEmailAndPassword
    await new Promise(r => setTimeout(r, 800)); // simulate network
    const newUser: AdminUser = { email, name: email.split("@")[0] };
    localStorage.setItem("chao_admin_user", JSON.stringify(newUser));
    setUser(newUser);
  };

  const register = async (name: string, email: string, _password: string) => {
    // TODO: replace with Firebase createUserWithEmailAndPassword
    await new Promise(r => setTimeout(r, 900));
    const newUser: AdminUser = { email, name };
    localStorage.setItem("chao_admin_user", JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("chao_admin_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
