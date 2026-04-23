"use client";

import React, { useState, useEffect } from "react";
import { CATEGORIES, MEATS, SIDES, MenuItem, MeatType, SideType, Category, Deal, ALLERGENS, Allergen } from "@/lib/menuData";
import { Plus, Search, Filter, Edit2, Trash2, X, Check, Loader2, Tag, AlertTriangle } from "lucide-react";
import { getDeals } from "@/lib/firebase/deals/service";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { 
  getMenuItems, 
  addMenuItem, 
  updateMenuItem, 
  deleteMenuItem 
} from "@/lib/firebase/menu/service";
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function MenuManagement() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeDeals, setActiveDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const [menuData, dealsData] = await Promise.all([
        getMenuItems(),
        getDeals()
      ]);
      setItems(menuData);
      setActiveDeals(dealsData.filter(d => d.isActive));
    } catch (error) {
      toast.error("Failed to load menu");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    try {
      await updateMenuItem(id, { available: !current });
      toast.success("Availability updated");
      fetchMenu();
    } catch (error) {
      toast.error("Failed to update availability");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.name || !editingItem?.category) {
      toast.error("Please fill in required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingItem.id) {
        await updateMenuItem(editingItem.id, editingItem);
        toast.success("Item updated");
      } else {
        await addMenuItem({
          name: editingItem.name || "",
          description: editingItem.description || "",
          basePrice: editingItem.basePrice || 0,
          category: editingItem.category as Category,
          availableMeats: editingItem.availableMeats || [],
          availableSides: editingItem.availableSides || [],
          available: true,
          emoji: editingItem.emoji || "🍛",
        });
        toast.success("Item added to menu");
      }
      setIsDialogOpen(false);
      setEditingItem(null);
      fetchMenu();
    } catch (error: any) {
      console.error("Firestore Menu Error:", error);
      toast.error(`Operation failed: ${error.message || 'Check console'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    toast.warning(`Delete ${name}?`, {
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await deleteMenuItem(id);
            toast.success("Removed from menu");
            fetchMenu();
          } catch (error) {
            toast.error("Failed to delete");
          }
        },
      },
    });
  };

  const handleMeatToggle = (meat: MeatType) => {
    const current = editingItem?.availableMeats || [];
    const updated = current.includes(meat)
      ? current.filter(m => m !== meat)
      : [...current, meat];
    setEditingItem({ ...editingItem, availableMeats: updated });
  };

  const handleSideToggle = (side: SideType) => {
    const current = editingItem?.availableSides || [];
    const updated = current.includes(side)
      ? current.filter(s => s !== side)
      : [...current, side];
    setEditingItem({ ...editingItem, availableSides: updated });
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-brand-text">Menu Management</h1>
          <p className="text-brand-muted font-body">Manage your restaurant's dishes, categories, and meats.</p>
        </div>
        
        <div 
          onClick={() => {
            setEditingItem({ availableMeats: [], availableSides: [], allergens: [], category: 'Main Course', basePrice: 0 });
            setIsDialogOpen(true);
          }}
          className="bg-brand-violet hover:bg-brand-violet-dark text-white rounded-xl font-display font-bold px-6 py-4 shadow-violet-glow flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Add Menu Item
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-white rounded-3xl p-8 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display font-bold text-brand-text">
                {editingItem?.id ? "Edit Item" : "Add New Item"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSave} className="space-y-6 mt-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Item Name</Label>
                  <Input 
                    value={editingItem?.name || ""}
                    onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                    placeholder="e.g. Green Curry"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select 
                    value={editingItem?.category} 
                    onValueChange={v => setEditingItem({...editingItem, category: v as Category})}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input 
                  value={editingItem?.description || ""}
                  onChange={e => setEditingItem({...editingItem, description: e.target.value})}
                  placeholder="Tell customers about this dish..."
                  className="rounded-xl"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Base Price (£)</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={editingItem?.basePrice || ""}
                    onChange={e => setEditingItem({...editingItem, basePrice: parseFloat(e.target.value)})}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Emoji Icon</Label>
                  <Input 
                    value={editingItem?.emoji || ""}
                    onChange={e => setEditingItem({...editingItem, emoji: e.target.value})}
                    placeholder="🍛"
                    className="rounded-xl"
                  />
                </div>
              </div>

              {(editingItem?.category === 'Main Course' || editingItem?.category === 'Curry') && (
                <>
                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-brand-muted uppercase tracking-wider">Meat Options</Label>
                    <div className="flex flex-wrap gap-3">
                      {MEATS.map(meat => (
                        <label 
                          key={meat} 
                          htmlFor={`meat-${meat}`}
                          className="flex items-center gap-3 bg-white hover:bg-brand-lavender/10 px-4 py-2.5 rounded-2xl border-2 border-brand-lavender-mid cursor-pointer transition-all active:scale-95 hover:border-brand-violet/30 group"
                        >
                          <Checkbox 
                            id={`meat-${meat}`}
                            checked={editingItem?.availableMeats?.includes(meat)}
                            onCheckedChange={() => handleMeatToggle(meat)}
                            className="shrink-0"
                          />
                          <span className="text-sm font-display font-bold text-brand-text group-hover:text-brand-violet transition-colors leading-none">
                            {meat}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-brand-muted uppercase tracking-wider">Side Options</Label>
                    <div className="flex flex-wrap gap-3">
                      {items.filter(i => i.category === 'Sides').map(sideItem => (
                        <label 
                          key={sideItem.id} 
                          htmlFor={`side-${sideItem.id}`}
                          className="flex items-center gap-3 bg-white hover:bg-brand-lavender/10 px-4 py-2.5 rounded-2xl border-2 border-brand-lavender-mid cursor-pointer transition-all active:scale-95 hover:border-brand-violet/30 group"
                        >
                          <Checkbox 
                            id={`side-${sideItem.id}`}
                            checked={editingItem?.availableSides?.includes(sideItem.name as any)}
                            onCheckedChange={() => {
                              const current = editingItem?.availableSides || [];
                              const updated = current.includes(sideItem.name as any)
                                ? current.filter(s => s !== sideItem.name)
                                : [...current, sideItem.name as any];
                              setEditingItem({ ...editingItem, availableSides: updated });
                            }}
                            className="shrink-0"
                          />
                          <span className="text-sm font-display font-bold text-brand-text group-hover:text-brand-violet transition-colors leading-none">
                            {sideItem.name}
                          </span>
                        </label>
                      ))}
                      {items.filter(i => i.category === 'Sides').length === 0 && (
                        <p className="text-xs text-brand-muted italic">No items found in 'Sides' category. Add them first!</p>
                      )}
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-3 pt-4 border-t border-brand-lavender-mid">
                <Label className="text-sm font-bold flex items-center gap-2 text-brand-muted uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Allergens & Dietary Information
                </Label>
                <div className="flex flex-wrap gap-3">
                  {ALLERGENS.map(allergen => (
                    <label 
                      key={allergen} 
                      htmlFor={`allergen-${allergen}`}
                      className="flex items-center gap-3 bg-amber-50 hover:bg-amber-100 px-4 py-2.5 rounded-2xl border-2 border-amber-200 cursor-pointer transition-all active:scale-95 hover:border-amber-400 group"
                    >
                      <Checkbox 
                        id={`allergen-${allergen}`}
                        checked={editingItem?.allergens?.includes(allergen)}
                        onCheckedChange={() => {
                          const current = editingItem?.allergens || [];
                          const updated = current.includes(allergen)
                            ? current.filter(a => a !== allergen)
                            : [...current, allergen];
                          setEditingItem({ ...editingItem, allergens: updated });
                        }}
                        className="shrink-0 border-amber-500 data-[state=checked]:bg-amber-500"
                      />
                      <span className="text-sm font-display font-bold text-amber-900 leading-none">
                        {allergen}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <Button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-violet hover:bg-brand-violet-dark text-white rounded-xl py-6 font-display font-bold"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                {editingItem?.id ? "Update Item" : "Create Item"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-[2rem] border border-brand-lavender-mid shadow-sm overflow-hidden">
        <div className="p-6 border-b border-brand-lavender-mid bg-white/50 flex items-center justify-between">
          <h3 className="font-display font-bold text-brand-text">Menu Roster</h3>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
            <input 
              type="text"
              placeholder="Search dishes..."
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
                <th className="px-8 py-4 text-xs font-display font-bold text-brand-muted uppercase tracking-wider">Dish</th>
                <th className="px-8 py-4 text-xs font-display font-bold text-brand-muted uppercase tracking-wider">Category</th>
                <th className="px-8 py-4 text-xs font-display font-bold text-brand-muted uppercase tracking-wider">Price</th>
                <th className="px-8 py-4 text-xs font-display font-bold text-brand-muted uppercase tracking-wider">Available Meats</th>
                <th className="px-8 py-4 text-xs font-display font-bold text-brand-muted uppercase tracking-wider text-center">Status</th>
                <th className="px-8 py-4 text-xs font-display font-bold text-brand-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-lavender-mid">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-brand-muted">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    Loading menu...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-brand-muted italic">
                    Your menu is currently empty.
                  </td>
                </tr>
              ) : filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-brand-lavender/5 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-lavender flex items-center justify-center text-xl shadow-sm border border-brand-lavender-mid">
                        {item.emoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-display font-bold text-brand-text">{item.name}</p>
                          {activeDeals.some(d => d.items.includes(item.id)) && (
                            <span className="bg-brand-violet text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                              <Tag className="w-2.5 h-2.5" />
                              Active Deal
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-brand-muted line-clamp-1">{item.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-display font-bold text-brand-muted text-xs uppercase tracking-wider">
                    {item.category}
                  </td>
                  <td className="px-8 py-6 font-display font-bold">
                    <div className="flex flex-col">
                      {activeDeals.find(d => d.items?.includes(item.id)) && (
                        <span className="text-[10px] text-brand-muted line-through">
                          £{item.basePrice.toFixed(2)}
                        </span>
                      )}
                      <span className="text-brand-text">
                        £{(activeDeals.find(d => d.items?.includes(item.id))?.dealPrice || item.basePrice).toFixed(2)}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap gap-1">
                        {item.availableMeats?.map(meat => (
                          <span key={meat} className="px-2 py-0.5 bg-brand-lavender/30 border border-brand-lavender-mid rounded-md text-[10px] font-bold text-brand-violet uppercase">
                            {meat}
                          </span>
                        ))}
                        {(!item.availableMeats || item.availableMeats.length === 0) && (
                          <span className="text-[10px] text-brand-muted italic">No Meat Options</span>
                        )}
                      </div>
                      
                      {item.allergens && item.allergens.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.allergens.map(a => (
                            <span key={a} className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[9px] font-bold uppercase tracking-widest flex items-center gap-1">
                              {a === 'Gluten' || a === 'Vegan' || a === 'Vegetarian' ? <AlertTriangle className="w-2.5 h-2.5" /> : <AlertTriangle className="w-2.5 h-2.5" />}
                              {a}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <Switch 
                      checked={item.available}
                      onCheckedChange={() => toggleAvailability(item.id, item.available)}
                      className="data-[state=checked]:bg-emerald-500 scale-90"
                    />
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => {
                          setEditingItem(item);
                          setIsDialogOpen(true);
                        }}
                        className="text-brand-muted hover:text-brand-violet hover:bg-brand-lavender/50 rounded-xl"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(item.id, item.name)}
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
