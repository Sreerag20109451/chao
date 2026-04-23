/**
 * (dashboard)/layout.tsx — Admin layout for authenticated routes
 */

import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[hsl(252_60%_95%)]">
      {/* Persistent left sidebar */}
      <Sidebar />

      {/* Main content area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
