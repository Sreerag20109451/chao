"use client";

import React, { useState, useEffect } from "react";
import { Bike, Search, Phone, CheckCircle2, Circle, Plus, MoreVertical, Trash2, Edit2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { 
  getDrivers, 
  addDriver, 
  updateDriver, 
  deleteDriver, 
  setPrimaryDriver,
  Driver 
} from "@/lib/firebase/drivers/service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function DriversPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const data = await getDrivers();
      setDrivers(data);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      toast.error("Failed to load drivers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return;

    try {
      await setPrimaryDriver(driverId);
      toast.success(`${driver.name} is now the primary driver.`);
      fetchDrivers();
    } catch (error) {
      toast.error("Failed to set active driver");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("UI: Form submit triggered", formData);
    if (!formData.name || !formData.phone) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingDriver) {
        await updateDriver(editingDriver.id, formData);
        toast.success("Driver updated successfully");
      } else {
        await addDriver({
          ...formData,
          status: "active",
          isWorkingToday: false
        });
        toast.success("Driver added successfully");
      }
      setIsModalOpen(false);
      setEditingDriver(null);
      setFormData({ name: "", phone: "" });
      fetchDrivers();
    } catch (error: any) {
      console.error("Driver operation failed:", error);
      const errorMessage = error?.message || "Check your internet or database permissions.";
      toast.error(`Failed: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    toast.warning(`Are you sure you want to delete ${name}?`, {
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await deleteDriver(id);
            toast.success("Driver deleted");
            fetchDrivers();
          } catch (error) {
            toast.error("Failed to delete driver");
          }
        },
      },
    });
  };

  const openEditModal = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({ name: driver.name, phone: driver.phone });
    setIsModalOpen(true);
  };

  const filteredDrivers = drivers.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeDriver = drivers.find(d => d.isWorkingToday);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-brand-text">Delivery Drivers</h1>
          <p className="text-brand-muted font-body">Manage and select your active driver for today's shifts.</p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            setEditingDriver(null);
            setFormData({ name: "", phone: "" });
          }
        }}>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-violet hover:bg-brand-violet-dark text-white rounded-xl font-display font-bold px-6 py-4 shadow-violet-glow flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Add New Driver
          </button>
          <DialogContent className="bg-white rounded-3xl p-8 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display font-bold text-brand-text">
                {editingDriver ? "Edit Driver" : "Add New Driver"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Shyam" 
                  className="rounded-xl border-brand-lavender-mid"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="e.g. 087 123 4567" 
                  className="rounded-xl border-brand-lavender-mid"
                />
              </div>
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-violet hover:bg-brand-violet-dark text-white rounded-xl py-6 font-display font-bold"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                {editingDriver ? "Update Driver" : "Create Driver"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
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
                <th className="px-8 py-4 text-xs font-display font-bold text-brand-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-lavender-mid">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-brand-muted">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    Loading drivers...
                  </td>
                </tr>
              ) : filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-brand-muted italic">
                    No drivers found.
                  </td>
                </tr>
              ) : filteredDrivers.map((driver) => (
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
                      onClick={() => handleToggleActive(driver.id)}
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
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openEditModal(driver)}
                        className="text-brand-muted hover:text-brand-violet hover:bg-brand-lavender/50 rounded-xl"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(driver.id, driver.name)}
                        className="text-brand-muted hover:text-red-500 hover:bg-red-50 rounded-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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
