"use client";

import React, { useState } from "react";
import { Bike, Search, Phone, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";

interface Driver {
  id: string;
  name: string;
  phone: string;
  status: "active" | "inactive";
  isWorkingToday: boolean;
}

export default function DriversPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [drivers, setDrivers] = useState<Driver[]>([
    { id: "DRV-001", name: "Shyam", phone: "087 123 4567", status: "active", isWorkingToday: true },
    { id: "DRV-002", name: "Jinu", phone: "089 987 6543", status: "active", isWorkingToday: false },
    { id: "DRV-003", name: "Nahas", phone: "085 444 3322", status: "active", isWorkingToday: false },
    { id: "DRV-004", name: "Renjith", phone: "086 555 1199", status: "active", isWorkingToday: false },
    { id: "DRV-005", name: "Sumith", phone: "083 111 2233", status: "active", isWorkingToday: false },
  ]);

  const setAsActiveDriver = (driverId: string) => {
    setDrivers(prev => prev.map(d => {
      if (d.id === driverId) {
        if (!d.isWorkingToday) {
          toast.success(`${d.name} is now the primary driver for today.`);
          return { ...d, isWorkingToday: true };
        }
        return d;
      }
      return { ...d, isWorkingToday: false };
    }));
  };

  const filteredDrivers = drivers.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeDriver = drivers.find(d => d.isWorkingToday);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-brand-text">Delivery Drivers</h1>
          <p className="text-brand-muted font-body">Manage and select your active driver for today's shifts.</p>
        </div>
      </div>

      {/* Active Driver Highlight */}
      <div className="bg-brand-violet rounded-[2.5rem] p-8 text-white shadow-violet-glow relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl border border-white/30">
              {activeDriver ? "🛵" : "💤"}
            </div>
            <div>
              <p className="text-xs font-display font-bold uppercase tracking-[0.2em] text-white/70 mb-1">Current Active Driver</p>
              <h2 className="text-4xl font-display font-bold">
                {activeDriver ? activeDriver.name : "No Driver Set"}
              </h2>
              {activeDriver && (
                <div className="flex items-center gap-3 mt-2 text-white/90">
                  <span className="flex items-center gap-1.5 bg-white/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                    <Phone className="w-4 h-4 mr-1" />
                    {activeDriver.phone}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="hidden md:block">
            <Bike className="w-24 h-24 text-white/10" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-brand-lavender-mid shadow-sm overflow-hidden">
        <div className="p-6 border-b border-brand-lavender-mid bg-white/50 flex items-center justify-between">
          <h3 className="font-display font-bold text-brand-text">Driver Roster</h3>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
            <input 
              type="text"
              placeholder="Search roster..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-brand-lavender/20 border border-brand-lavender-mid rounded-xl font-body text-xs focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-lavender/10 border-b border-brand-lavender-mid">
                <th className="px-8 py-4 text-xs font-display font-bold text-brand-muted uppercase tracking-wider">Name</th>
                <th className="px-8 py-4 text-xs font-display font-bold text-brand-muted uppercase tracking-wider text-center">Set for Today</th>
                <th className="px-8 py-4 text-xs font-display font-bold text-brand-muted uppercase tracking-wider">Contact</th>
                <th className="px-8 py-4 text-xs font-display font-bold text-brand-muted uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-lavender-mid">
              {filteredDrivers.map((driver) => (
                <tr key={driver.id} className={`transition-all ${driver.isWorkingToday ? 'bg-brand-violet/[0.02]' : 'hover:bg-brand-lavender/5'}`}>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-display font-bold transition-all ${
                        driver.isWorkingToday ? 'bg-brand-violet text-white shadow-violet-glow' : 'bg-brand-lavender text-brand-violet'
                      }`}>
                        {driver.name[0]}
                      </div>
                      <p className={`font-display font-bold text-lg ${driver.isWorkingToday ? 'text-brand-violet' : 'text-brand-text'}`}>
                        {driver.name}
                      </p>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <button 
                      onClick={() => setAsActiveDriver(driver.id)}
                      className="group relative inline-flex items-center justify-center transition-all"
                    >
                      {driver.isWorkingToday ? (
                        <div className="flex flex-col items-center gap-1 text-brand-violet scale-110">
                          <CheckCircle2 className="w-8 h-8 fill-brand-violet text-white" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Active</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-brand-muted hover:text-brand-violet transition-colors">
                          <Circle className="w-8 h-8" />
                          <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Select</span>
                        </div>
                      )}
                    </button>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-brand-muted" />
                      <p className="font-body text-sm text-brand-text font-bold">{driver.phone}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      driver.status === "active" 
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                        : "bg-zinc-100 text-zinc-500 border border-zinc-200"
                    }`}>
                      {driver.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
