"use client";

/**
 * authContext.tsx — Admin App
 *
 * Lightweight auth context. Currently backed by localStorage so the session
 * survives a page refresh. Swap out the login/register handlers for real
 * Firebase / API calls when ready.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "sonner";
import { loginAdmin, logoutUser } from "./firebase";

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
  logout: () => Promise<void>;
  userRole: string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * AuthProvider component that wraps the application and provides authentication state.
 * Handles user session persistence, role fetching, and auth method orchestration.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    let isFirstLoad = true;

    // Safety timeout: force hide loading if Firebase hangs
    const safetyTimeout = setTimeout(() => {
      if (isFirstLoad) {
        console.warn("Auth: Safety timeout triggered. Firebase Auth might be hanging.");
        setIsLoading(false);
        isFirstLoad = false;
      }
    }, 5000);

    // Listens for auth state changes (login, logout, token refresh)
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Attempt to fetch user role from Firestore
          try {
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              if (userData?.userrole !== "admin") {
                setUser(null);
                await logoutUser();
                toast.error("This account is for customer ordering. Please use the customer site.");
                return;
              }

              setUser({
                email: firebaseUser.email,
                name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Admin",
                uid: firebaseUser.uid,
                role: "admin"
              });
            } else {
              setUser(null);
              await logoutUser();
              toast.error("No admin profile was found for this account.");
              return;
            }
          } catch (firestoreError: unknown) {
            const message = firestoreError instanceof Error ? firestoreError.message : String(firestoreError);
            console.error("Auth listener Firestore error:", message);
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Critical error in onAuthStateChanged:", error);
        setUser(null);
      } finally {
        if (isFirstLoad) {
          setIsLoading(false);
          isFirstLoad = false;
        }
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, []);

  /**
   * Logs in an admin user.
   * Calls the firebase service and handles error toast notifications.
   */
  const login = async (email: string, password: string) => {
    try {
      await loginAdmin(email, password);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Login failed. Please try again.";
      console.warn(`Login error: ${message}`);
      toast.error(message);
      throw error;
    }
  };

  /**
   * Signs out the current admin.
   */
  const logout = async () => {
    try {
      // Clear local state first to prevent background listeners from trying to fetch data
      setUser(null);
      await logoutUser();
      toast.info("Logged out successfully.");
    } catch (error: unknown) {
      console.warn(`Logout error: ${error instanceof Error ? error.message : "Unknown error"}`);
      toast.error("Error logging out.");
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      logout,
      userRole: user?.role || null 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to access the AuthContext.
 * @returns The authentication context value.
 * @throws Error if used outside of an AuthProvider.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
