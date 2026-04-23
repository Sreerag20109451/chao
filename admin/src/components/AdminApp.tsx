"use client";

/**
 * AdminApp.tsx — Root SPA shell.
 *
 * Route structure:
 *   Public  → /landing  (LandingPage)
 *           → /login    (LoginPage)
 *           → /register (RegisterPage)
 *   Private → /         (Dashboard)
 *           → /menu     (MenuManagement)
 *           → /orders   (AdminOrders)
 *           → /settings (AdminSettings)
 *
 * <ProtectedRoute> redirects unauthenticated users to /landing.
 * <PublicRoute>    redirects already-authenticated users to /.
 */

import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/authContext";

import AdminNavbar    from "./AdminNavbar";
import Sidebar        from "./Sidebar";
import DashboardPage  from "./pages/Dashboard";
import MenuManagement from "./pages/MenuManagement";
import AdminOrders    from "./pages/Orders";
import AdminSettings  from "./pages/Settings";
import Billing        from "./pages/Billing";
import Drivers        from "./pages/Drivers";
import LandingPage    from "./pages/LandingPage";
import LoginPage      from "./pages/LoginPage";
import RegisterPage   from "./pages/RegisterPage";

// ── Spinner shown while auth state is loading from localStorage ────────────────
function AuthLoadingScreen() {
  return (
    <div className="min-h-screen bg-[hsl(240_15%_7%)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-[hsl(250_78%_60%/0.3)] border-t-[hsl(250_78%_60%)] animate-spin" />
        <p className="text-sm text-[hsl(252_20%_50%)] font-display">Loading…</p>
      </div>
    </div>
  );
}

// ── Guards ─────────────────────────────────────────────────────────────────────
function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <AuthLoadingScreen />;
  if (!user) return <Navigate to="/landing" replace />;
  return <Outlet />;
}

function PublicRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <AuthLoadingScreen />;
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}

// ── Dashboard shell (sidebar + navbar + page outlet) ──────────────────────────
function DashboardShell() {
  return (
    <div className="min-h-screen bg-lavender-gradient flex">
      <div className="hidden md:flex">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar />
        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Public routes — redirect to dashboard if already logged in */}
      <Route element={<PublicRoute />}>
        <Route path="/landing"  element={<LandingPage />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected routes — redirect to /landing if not logged in */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardShell />}>
          <Route path="/"         element={<DashboardPage />} />
          <Route path="/billing"  element={<Billing />} />
          <Route path="/menu"     element={<MenuManagement />} />
          <Route path="/orders"   element={<AdminOrders />} />
          <Route path="/drivers"  element={<Drivers />} />
          <Route path="/settings" element={<AdminSettings />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/landing" replace />} />
    </Routes>
  );
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
