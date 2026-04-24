import React, { useState, useEffect } from "react";
import { Settings, Bell, Shield, Store, Globe, Save, Loader2 } from "lucide-react";
import { listenToStoreSettings, updateOpeningHours, StoreSettings } from "@/lib/firebase/settings/service";
import { toast } from "sonner";

export default function AdminSettings() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsub = listenToStoreSettings((data) => {
      setSettings(data);
    });
    return () => unsub();
  }, []);

  const handleSaveHours = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      await updateOpeningHours(settings.openingHours);
      toast.success("Operating hours updated successfully");
    } catch (error) {
      toast.error("Failed to update operating hours");
    } finally {
      setIsSaving(false);
    }
  };

  if (!settings) return <div className="p-8"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;

  const days = [
    { id: 'mon', label: 'Monday' },
    { id: 'tue', label: 'Tuesday' },
    { id: 'wed', label: 'Wednesday' },
    { id: 'thu', label: 'Thursday' },
    { id: 'fri', label: 'Friday' },
    { id: 'sat', label: 'Saturday' },
    { id: 'sun', label: 'Sunday' },
  ] as const;

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-display font-bold text-brand-text">Settings</h1>
        <p className="text-brand-muted font-body">Configure your store settings and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
          <nav className="flex flex-col gap-1">
            {[
              { label: "General", icon: <Store className="w-4 h-4" />, active: true },
              { label: "Notifications", icon: <Bell className="w-4 h-4" />, active: false },
              { label: "Security", icon: <Shield className="w-4 h-4" />, active: false },
              { label: "Website", icon: <Globe className="w-4 h-4" />, active: false },
            ].map((item) => (
              <button 
                key={item.label}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-display font-bold transition-all ${
                  item.active 
                    ? "bg-brand-violet text-white shadow-violet-glow" 
                    : "text-brand-muted hover:text-brand-violet hover:bg-brand-lavender"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="md:col-span-3 space-y-6">
          <div className="bg-white rounded-[2rem] border border-brand-lavender-mid p-8 shadow-sm space-y-8">
            <section className="space-y-6">
              <h3 className="font-display font-bold text-xl text-brand-text border-b border-brand-lavender-mid pb-4">Store Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-display font-bold text-brand-muted uppercase tracking-widest">Restaurant Name</label>
                  <input type="text" defaultValue="Chao Thai" className="w-full bg-brand-lavender/20 border border-brand-lavender-mid rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-violet/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-display font-bold text-brand-muted uppercase tracking-widest">Contact Email</label>
                  <input type="email" defaultValue="hello@chaothai.ie" className="w-full bg-brand-lavender/20 border border-brand-lavender-mid rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-violet/20" />
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h3 className="font-display font-bold text-xl text-brand-text border-b border-brand-lavender-mid pb-4">Operating Hours</h3>
              <div className="space-y-4">
                {days.map((day) => (
                  <div key={day.id} className="flex items-center justify-between gap-4">
                    <span className="font-body text-sm text-brand-text w-24">{day.label}</span>
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        value={settings.openingHours[day.id].open} 
                        onChange={(e) => {
                          const newHours = { ...settings.openingHours };
                          newHours[day.id] = { ...newHours[day.id], open: e.target.value };
                          setSettings({ ...settings, openingHours: newHours });
                        }}
                        className="w-24 bg-brand-lavender/20 border border-brand-lavender-mid rounded-lg px-3 py-1.5 text-xs text-center" 
                      />
                      <span className="text-brand-muted">to</span>
                      <input 
                        type="text" 
                        value={settings.openingHours[day.id].close} 
                        onChange={(e) => {
                          const newHours = { ...settings.openingHours };
                          newHours[day.id] = { ...newHours[day.id], close: e.target.value };
                          setSettings({ ...settings, openingHours: newHours });
                        }}
                        className="w-24 bg-brand-lavender/20 border border-brand-lavender-mid rounded-lg px-3 py-1.5 text-xs text-center" 
                      />
                      <label className="flex items-center gap-2 ml-4">
                        <input 
                          type="checkbox" 
                          checked={!!settings.openingHours[day.id].closed} 
                          onChange={(e) => {
                            const newHours = { ...settings.openingHours };
                            newHours[day.id] = { ...newHours[day.id], closed: e.target.checked };
                            setSettings({ ...settings, openingHours: newHours });
                          }}
                        />
                        <span className="text-[10px] uppercase font-bold text-brand-muted">Closed</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="pt-6">
              <button 
                onClick={handleSaveHours}
                disabled={isSaving}
                className="flex items-center gap-2 bg-brand-violet text-white px-8 py-4 rounded-2xl font-display font-bold shadow-violet-glow hover:bg-brand-violet-dark transition-all disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
