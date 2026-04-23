import React, { useState } from "react";
import { initialMenuItems, MenuItem, categories, PROTEIN_LIST, SIDE_LIST } from "@/lib/menuData";
import { Plus, Search, Filter, Edit2, Trash2, X, Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function MenuManagement() {
  const [items, setItems] = useState(initialMenuItems);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const handleEdit = (item: MenuItem) => {
    setEditingItem({ ...item });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingItem) return;

    if (editingItem.id.startsWith('temp')) {
      const newItem = { ...editingItem, id: `item-${Date.now()}` };
      setItems(prev => [...prev, newItem]);
      toast.success(`${newItem.name} added to menu`);
    } else {
      setItems(prev => prev.map(item => 
        item.id === editingItem.id ? editingItem : item
      ));
      toast.success(`${editingItem.name} updated successfully`);
    }
    
    setIsDialogOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    const item = items.find(i => i.id === id);
    if (window.confirm(`Are you sure you want to delete ${item?.name}?`)) {
      setItems(prev => prev.filter(i => i.id !== id));
      toast.error(`${item?.name} removed from menu`);
    }
  };

  const handleToggleOption = (type: 'protein' | 'side', option: string) => {
    if (!editingItem) return;

    const field = type === 'protein' ? 'proteinOptions' : 'sideOptions';
    const currentOptions = editingItem[field] || [];
    
    const newOptions = currentOptions.includes(option)
      ? currentOptions.filter(o => o !== option)
      : [...currentOptions, option];
    
    setEditingItem({ ...editingItem, [field]: newOptions });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-brand-text">Menu Management</h1>
          <p className="text-brand-muted font-body">Manage your restaurant's dishes and pricing.</p>
        </div>
        <button 
          onClick={() => {
            const newItem: MenuItem = {
              id: `temp-${Date.now()}`,
              name: "",
              description: "",
              price: 0,
              category: "mains",
              tags: [],
              emoji: "🍛",
              available: true,
            };
            setEditingItem(newItem);
            setIsDialogOpen(true);
          }}
          className="flex items-center gap-2 bg-brand-violet text-white px-6 py-3 rounded-xl font-display font-bold shadow-violet-glow hover:bg-brand-violet-dark transition-all"
        >
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
                      <button 
                        onClick={() => handleEdit(item)}
                        className="p-2 hover:bg-brand-lavender rounded-lg text-brand-muted hover:text-brand-violet transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-brand-muted hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-[2rem] border-brand-lavender-mid">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display font-bold text-brand-text">
              {editingItem?.id.startsWith('temp') ? 'Add New Dish' : 'Edit Dish'}
            </DialogTitle>
            <DialogDescription className="font-body text-brand-muted">
              Update the details for this menu item.
            </DialogDescription>
          </DialogHeader>

          {editingItem && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-display font-bold text-brand-text">Name</Label>
                  <Input 
                    id="name" 
                    value={editingItem.name} 
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="border-brand-lavender-mid focus:ring-brand-violet"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-display font-bold text-brand-text">Price (£)</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    step="0.01"
                    value={editingItem.price} 
                    onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })}
                    className="border-brand-lavender-mid focus:ring-brand-violet"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-display font-bold text-brand-text">Description</Label>
                <Input 
                  id="description" 
                  value={editingItem.description} 
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="border-brand-lavender-mid focus:ring-brand-violet"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-display font-bold text-brand-text">Category</Label>
                  <select 
                    id="category"
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-brand-lavender-mid rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-violet/20"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emoji" className="text-sm font-display font-bold text-brand-text">Emoji</Label>
                  <Input 
                    id="emoji" 
                    value={editingItem.emoji} 
                    onChange={(e) => setEditingItem({ ...editingItem, emoji: e.target.value })}
                    className="border-brand-lavender-mid focus:ring-brand-violet"
                  />
                </div>
              </div>

              {(editingItem.category === "curries" || editingItem.category === "mains") && (
                <div className="space-y-6 pt-4 border-t border-brand-lavender-mid">
                  <div className="space-y-3">
                    <Label className="text-sm font-display font-bold text-brand-text block">Protein Options</Label>
                    <div className="flex flex-wrap gap-2">
                      {PROTEIN_LIST.map(option => (
                        <button
                          key={option}
                          onClick={() => handleToggleOption('protein', option)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                            editingItem.proteinOptions?.includes(option)
                              ? 'bg-brand-violet text-white border-brand-violet shadow-sm'
                              : 'bg-brand-lavender/20 text-brand-muted border-brand-lavender-mid hover:bg-brand-lavender/40'
                          }`}
                        >
                          {editingItem.proteinOptions?.includes(option) && <Check className="w-3 h-3 inline mr-1" />}
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-display font-bold text-brand-text block">Side Options</Label>
                    <div className="flex flex-wrap gap-2">
                      {SIDE_LIST.map(option => (
                        <button
                          key={option}
                          onClick={() => handleToggleOption('side', option)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                            editingItem.sideOptions?.includes(option)
                              ? 'bg-brand-violet text-white border-brand-violet shadow-sm'
                              : 'bg-brand-lavender/20 text-brand-muted border-brand-lavender-mid hover:bg-brand-lavender/40'
                          }`}
                        >
                          {editingItem.sideOptions?.includes(option) && <Check className="w-3 h-3 inline mr-1" />}
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              className="border-brand-lavender-mid text-brand-muted hover:bg-brand-lavender/10"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-brand-violet hover:bg-brand-violet-dark text-white shadow-violet-glow"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
