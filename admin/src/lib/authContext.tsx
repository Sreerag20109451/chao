"use client";

/**
 * authContext.tsx — Admin App
 *
 * Lightweight auth context. Currently backed by localStorage so the session
 * survives a page refresh. Swap out the login/register handlers for real
 * Firebase / API calls when ready.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from "sonner";
import { registerAdmin, loginAdmin, logoutUser } from "./firebase";

interface AdminUser {
  email: string | null;
  name: string | null;
  uid: string;
  role: string;
}

interface AuthContextValue {
  user: AdminUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const { doc, getDoc } = await import("firebase/firestore");
          const { db } = await import("./firebase");
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          const userData = userDoc.data();
          
          console.log(`Auth: Current user role is: ${userData?.userrole || "client"}`);
          setUser({
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Admin",
            uid: firebaseUser.uid,
            role: userData?.userrole || "client"
          });
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUser({
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Admin",
            uid: firebaseUser.uid,
            role: "client"
          });
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await loginAdmin(email, password);
    } catch (error: any) {
      console.error("Login error:", error);
      const message = error?.message || (typeof error === 'string' ? error : "Login failed. Please try again.");
      toast.error(message);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const firebaseUser = await registerAdmin(name, email, password);
      
      setUser({
        email: firebaseUser.email,
        name: name,
        uid: firebaseUser.uid
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      const message = error?.message || (typeof error === 'string' ? error : "Registration failed. Please try again.");
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      toast.info("Logged out successfully.");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error("Error logging out.");
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      register, 
      logout,
      userRole: user?.role || null 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
