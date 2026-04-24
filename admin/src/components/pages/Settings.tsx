import React, { useState, useEffect } from "react";
import { Settings, Bell, Shield, Store, Globe, Save, Loader2 } from "lucide-react";
import { listenToStoreSettings, updateStoreSettings, StoreSettings } from "@/lib/firebase/settings/service";
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

  const handleSaveSettings = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      await updateStoreSettings(settings);
      toast.success("Settings updated successfully");
    } catch (error) {
      toast.error("Failed to update settings");
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
    <div className="max-w-3xl space-y-8 animate-in fade-in duration-700 mx-auto">
      <div>
        <h1 className="text-3xl font-display font-bold text-brand-text">Settings</h1>
        <p className="text-brand-muted font-body">Configure your store information and operating hours.</p>
      </div>

      <div className="bg-white rounded-[2rem] border border-brand-lavender-mid p-8 shadow-sm space-y-8">
        <section className="space-y-6">
          <h3 className="font-display font-bold text-xl text-brand-text border-b border-brand-lavender-mid pb-4">Store Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-display font-bold text-brand-muted uppercase tracking-widest">Restaurant Name</label>
              <input 
                type="text" 
                value={settings.storeName} 
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full bg-brand-lavender/20 border border-brand-lavender-mid rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-violet/20" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-display font-bold text-brand-muted uppercase tracking-widest">Contact Email</label>
              <input 
                type="email" 
                value={settings.storeEmail} 
                onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                className="w-full bg-brand-lavender/20 border border-brand-lavender-mid rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-violet/20" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-display font-bold text-brand-muted uppercase tracking-widest">Min. Preparation Time (Mins)</label>
              <input 
                type="number" 
                value={settings.minPrepTime} 
                onChange={(e) => setSettings({ ...settings, minPrepTime: parseInt(e.target.value) || 0 })}
                className="w-full bg-brand-lavender/20 border border-brand-lavender-mid rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-violet/20" 
              />
              <p className="text-[10px] text-brand-muted font-body">Users can only select a pickup time starting from this many minutes from now.</p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="font-display font-bold text-xl text-brand-text border-b border-brand-lavender-mid pb-4">Meat Options</h3>
          <div className="space-y-4">
            {["Tofu", "Paneer", "Chicken", "Duck", "Lamb", "Prawn", "Beef"].map((meatName) => {
              const option = settings.meatOptions?.[meatName] || { price: 0, available: true };
              return (
                <div key={meatName} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-brand-lavender/5 p-4 rounded-xl border border-brand-lavender-mid">
                  <span className="font-display font-bold text-brand-text w-24">{meatName}</span>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-brand-muted font-bold uppercase tracking-widest">Extra Price (€)</span>
                      <input 
                        type="number"
                        step="1"
                        min="0"
                        value={option.price}
                        onChange={(e) => {
                          const newMeatOptions = { ...settings.meatOptions };
                          newMeatOptions[meatName] = { ...option, price: parseFloat(e.target.value) || 0 };
                          setSettings({ ...settings, meatOptions: newMeatOptions });
                        }}
                        className="w-20 bg-white border border-brand-lavender-mid rounded-lg px-3 py-1.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-brand-violet/20"
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className="relative">
                        <input 
                          type="checkbox"
                          className="sr-only peer"
                          checked={option.available}
                          onChange={(e) => {
                            const newMeatOptions = { ...settings.meatOptions };
                            newMeatOptions[meatName] = { ...option, available: e.target.checked };
                            setSettings({ ...settings, meatOptions: newMeatOptions });
                          }}
                        />
                        <div className="w-11 h-6 bg-brand-lavender-mid peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-violet/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest text-brand-muted w-20">
                        {option.available ? "Available" : "Unavailable"}
                      </span>
                    </label>
                  </div>
                </div>
              );
            })}
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
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="flex items-center gap-2 bg-brand-violet text-white px-8 py-4 rounded-2xl font-display font-bold shadow-violet-glow hover:bg-brand-violet-dark transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
