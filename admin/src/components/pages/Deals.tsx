"use client";

import React, { useState, useEffect } from "react";
import { MenuItem, Deal, CATEGORIES } from "@/lib/menuData";
import { Plus, Search, Tag, Calendar, Clock, Trash2, Edit2, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { getMenuItems } from "@/lib/firebase/menu/service";
import { 
  getDeals, 
  addDeal, 
  updateDeal, 
  deleteDeal 
} from "@/lib/firebase/deals/service";
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
import { Checkbox } from "@/components/ui/checkbox";

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Partial<Deal> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itemSearchTerm, setItemSearchTerm] = useState("");

  const filteredMenuItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(itemSearchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(itemSearchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dealsData, menuData] = await Promise.all([
        getDeals(),
        getMenuItems()
      ]);
      setDeals(dealsData);
      setMenuItems(menuData);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeal?.title || !editingDeal?.dealPrice || !editingDeal?.items?.length) {
      toast.error("Please fill in required fields and select items");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingDeal.id) {
        await updateDeal(editingDeal.id, editingDeal);
        toast.success("Deal updated");
      } else {
        await addDeal({
          title: editingDeal.title || "",
          description: editingDeal.description || "",
          dealPrice: editingDeal.dealPrice || 0,
          items: editingDeal.items || [],
          startDate: editingDeal.startDate || new Date().toISOString(),
          endDate: editingDeal.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true
        });
        toast.success("New deal created");
      }
      setIsDialogOpen(false);
      setEditingDeal(null);
      fetchData();
    } catch (error: any) {
      console.error("Firestore Deal Error:", error);
      toast.error(`Operation failed: ${error.message || 'Check console'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string, title: string) => {
    toast.warning(`Delete deal "${title}"?`, {
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await deleteDeal(id);
            toast.success("Deal removed");
            fetchData();
          } catch (error) {
            toast.error("Failed to delete");
          }
        },
      },
    });
  };

  const toggleItemSelection = (itemId: string) => {
    const current = editingDeal?.items || [];
    const updated = current.includes(itemId)
      ? current.filter(id => id !== itemId)
      : [...current, itemId];
    setEditingDeal({ ...editingDeal, items: updated });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-brand-text">Restaurant Deals</h1>
          <p className="text-brand-muted font-body">Create bundles and promotional offers for your customers.</p>
        </div>
        
        <div 
          onClick={() => {
            setEditingDeal({ items: [], isActive: true, dealPrice: 0 });
            setIsDialogOpen(true);
          }}
          className="bg-brand-violet hover:bg-brand-violet-dark text-white rounded-xl font-display font-bold px-6 py-4 shadow-violet-glow flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Create New Deal
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-white rounded-3xl p-8 max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display font-bold text-brand-text">
                {editingDeal?.id ? "Edit Deal" : "Configure Deal"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSave} className="space-y-6 mt-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Deal Title</Label>
                  <Input 
                    value={editingDeal?.title || ""}
                    onChange={e => setEditingDeal({...editingDeal, title: e.target.value})}
                    placeholder="e.g. Midweek Lunch Combo"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Deal Price (£)</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={editingDeal?.dealPrice || ""}
                    onChange={e => setEditingDeal({...editingDeal, dealPrice: parseFloat(e.target.value)})}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input 
                  value={editingDeal?.description || ""}
                  onChange={e => setEditingDeal({...editingDeal, description: e.target.value})}
                  placeholder="What's included in this deal?"
                  className="rounded-xl"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input 
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={editingDeal?.startDate ? new Date(editingDeal.startDate).toISOString().split('T')[0] : ""}
                    onChange={e => setEditingDeal({...editingDeal, startDate: e.target.value})}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input 
                    type="date"
                    min={editingDeal?.startDate ? new Date(editingDeal.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                    value={editingDeal?.endDate ? new Date(editingDeal.endDate).toISOString().split('T')[0] : ""}
                    onChange={e => setEditingDeal({...editingDeal, endDate: e.target.value})}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold text-brand-muted uppercase tracking-wider">Include Items from Menu</Label>
                  <div className="relative w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-muted" />
                    <input 
                      type="text"
                      placeholder="Find item..."
                      value={itemSearchTerm}
                      onChange={(e) => setItemSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-brand-lavender/20 border border-brand-lavender-mid rounded-xl font-body text-[10px] focus:outline-none focus:ring-1 focus:ring-brand-violet/30"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4 max-h-64 overflow-y-auto p-4 border-2 border-brand-lavender-mid rounded-3xl bg-brand-lavender/10">
                  {filteredMenuItems.map(item => (
                    <label 
                      key={item.id} 
                      htmlFor={`item-${item.id}`}
                      className="flex items-center gap-4 p-4 bg-white hover:bg-brand-violet/5 rounded-2xl border-2 border-transparent hover:border-brand-violet/20 cursor-pointer transition-all active:scale-95 group"
                    >
                      <Checkbox 
                        id={`item-${item.id}`}
                        checked={editingDeal?.items?.includes(item.id)}
                        onCheckedChange={() => toggleItemSelection(item.id)}
                        className="data-[state=checked]:scale-110 transition-transform"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-display font-bold text-brand-text group-hover:text-brand-violet transition-colors truncate">
                          {item.name}
                        </span>
                        <span className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">
                          £{item.basePrice.toFixed(2)} • {item.category}
                        </span>
                      </div>
                    </label>
                  ))}
                  {filteredMenuItems.length === 0 && (
                    <div className="col-span-full py-8 text-center text-brand-muted italic">
                      {itemSearchTerm ? "No items match your search." : "No menu items found."}
                    </div>
                  )}
                </div>
              </div>

              <Button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-violet hover:bg-brand-violet-dark text-white rounded-xl py-6 font-display font-bold"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                {editingDeal?.id ? "Update Deal" : "Publish Deal"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full py-20 text-center text-brand-muted">
            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" />
            <p className="font-display">Loading deals...</p>
          </div>
        ) : deals.length === 0 ? (
          <div className="col-span-full py-20 bg-white/50 rounded-[2.5rem] border border-dashed border-brand-lavender-mid text-center">
            <Tag className="w-12 h-12 text-brand-lavender-mid mx-auto mb-4" />
            <p className="font-display text-brand-muted">No active deals. Create your first promotion!</p>
          </div>
        ) : deals.map(deal => (
          <div key={deal.id} className="bg-white rounded-[2rem] border border-brand-lavender-mid shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-brand-violet/10 flex items-center justify-center text-brand-violet">
                  <Tag className="w-6 h-6" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingDeal(deal); setIsDialogOpen(true); }} className="p-2 text-brand-muted hover:text-brand-violet hover:bg-brand-lavender/50 rounded-lg">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(deal.id, deal.title)} className="p-2 text-brand-muted hover:text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="font-display font-bold text-xl text-brand-text group-hover:text-brand-violet transition-colors">{deal.title}</h3>
                <p className="text-xs text-brand-muted mt-1 font-body">{deal.description}</p>
              </div>

              <div className="bg-brand-lavender/30 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Deal Price</p>
                  <p className="text-2xl font-display font-bold text-brand-violet">£{deal.dealPrice.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Items</p>
                  <p className="text-lg font-display font-bold text-brand-text">{deal.items.length}</p>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-brand-muted">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  {new Date(deal.startDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  {new Date(deal.endDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
