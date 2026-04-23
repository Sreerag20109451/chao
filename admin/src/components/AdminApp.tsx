"use client";

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import Sidebar from "./Sidebar";
import DashboardPage from "./pages/Dashboard";
import MenuManagement from "./pages/MenuManagement";
import AdminOrders from "./pages/Orders";
import AdminSettings from "./pages/Settings";

export default function AdminApp() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-lavender-gradient flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex">
          <Sidebar />
        </div>
        
        <div className="flex-1 flex flex-col min-w-0">
          <AdminNavbar />
          <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/menu" element={<MenuManagement />} />
              <Route path="/orders" element={<AdminOrders />} />
              <Route path="/settings" element={<AdminSettings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
