import React, { useState } from "react";
import { initialMenuItems } from "@/lib/menuData";
import { Plus, Search, Filter, Edit2, Trash2, MoreVertical } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function MenuManagement() {
  const [items, setItems] = useState(initialMenuItems);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleAvailability = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, available: !item.available } : item
    ));
    const item = items.find(i => i.id === id);
    toast.success(`${item?.name} is now ${!item?.available ? 'active' : 'inactive'}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-brand-text">Menu Management</h1>
          <p className="text-brand-muted font-body">Manage your restaurant's dishes and pricing.</p>
        </div>
        <button className="flex items-center gap-2 bg-brand-violet text-white px-6 py-3 rounded-xl font-display font-bold shadow-violet-glow hover:bg-brand-violet-dark transition-all">
          <Plus className="w-5 h-5" />
          Add New Dish
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-brand-lavender-mid shadow-sm overflow-hidden">
        <div className="p-6 border-b border-brand-lavender-mid flex flex-col md:flex-row gap-4 items-center justify-between bg-white/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
            <input 
              type="text"
              placeholder="Search dishes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-brand-lavender/20 border border-brand-lavender-mid rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-violet/20"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-brand-lavender-mid rounded-xl font-display font-bold text-sm text-brand-text hover:bg-brand-lavender transition-all">
            <Filter className="w-4 h-4 text-brand-violet" />
            Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-lavender/10">
                <th className="px-6 py-4 text-xs font-display font-bold text-brand-muted uppercase tracking-wider">Item</th>
                <th className="px-6 py-4 text-xs font-display font-bold text-brand-muted uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-display font-bold text-brand-muted uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-xs font-display font-bold text-brand-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-display font-bold text-brand-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-lavender-mid">
              {filteredItems.map((item) => (
                <tr key={item.id} className={`hover:bg-brand-lavender/5 transition-all group ${!item.available ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner shrink-0 transition-all ${item.available ? 'bg-brand-lavender' : 'bg-zinc-100'}`}>
                        {item.emoji}
                      </div>
                      <div>
                        <p className="font-display font-bold text-brand-text">{item.name}</p>
                        <p className="text-xs text-brand-muted font-body line-clamp-1">{item.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${
                      item.available 
                        ? 'bg-brand-violet/5 text-brand-violet border-brand-violet/10' 
                        : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                    }`}>
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-display font-bold text-brand-text">
                    £{item.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Switch 
                        checked={item.available}
                        onCheckedChange={() => toggleAvailability(item.id)}
                      />
                      <span className={`text-[10px] font-bold font-display uppercase tracking-wider ${item.available ? 'text-emerald-600' : 'text-zinc-400'}`}>
                        {item.available ? 'Active' : 'Hidden'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-brand-lavender rounded-lg text-brand-muted hover:text-brand-violet transition-all"><Edit2 className="w-4 h-4" /></button>
                      <button className="p-2 hover:bg-red-50 rounded-lg text-brand-muted hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
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
