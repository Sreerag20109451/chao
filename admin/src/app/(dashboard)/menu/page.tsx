"use client";

/**
 * (dashboard)/menu/page.tsx — Menu Management
 *
 * A table view of all menu items allowing the admin to toggle availability,
 * edit prices, or update descriptions. Shows how the complex shadcn <Table>
 * integrates with the fonts (Sarabun for table data, Bai Jamjuree for headers).
 */

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch"; // We need to add switch component
import { initialMenuItems, type MenuItem } from "@/lib/menuData";
import { Search, Plus, Filter, Edit2, MoreHorizontal } from "lucide-react";
import { toast } from "sonner"; // Using sonner as requested during shadcn scaffold

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>(initialMenuItems);
  const [search, setSearch] = useState("");

  /* Filter items based on search query */
  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
  );

  /* Toggle availability handler */
  const toggleAvailable = (id: string, currentStatus: boolean) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, available: !currentStatus } : i))
    );
    toast.success(`Item ${currentStatus ? "disabled" : "enabled"} successfully`);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-[hsl(240_15%_8%)]">Menu Management</h1>
          <p className="font-body text-[hsl(240_10%_45%)]">Add, edit, or disable menu items.</p>
        </div>
        <Button className="bg-[hsl(250_78%_60%)] hover:bg-[hsl(250_78%_45%)] text-white shadow-violet-glow font-display font-semibold px-6 rounded-full h-11">
          <Plus className="w-4 h-4 mr-2" />
          Add New Dish
        </Button>
      </div>

      {/* Toolbar (Search & Filter) */}
      <div className="bg-white p-4 rounded-xl border border-[hsl(252_35%_88%)] flex flex-wrap gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(240_10%_45%)]" />
          <Input
            placeholder="Search dishes or categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-[hsl(252_60%_97%)] border-transparent hover:border-[hsl(252_35%_85%)] focus:bg-white transition-colors"
          />
        </div>
        <Button variant="outline" className="font-display text-[hsl(240_15%_8%)]">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-[hsl(252_35%_88%)] overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-[hsl(252_60%_97%)]">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-display font-semibold text-[hsl(240_15%_8%)] w-16 text-center">Icon</TableHead>
              <TableHead className="font-display font-semibold text-[hsl(240_15%_8%)]">Dish Name</TableHead>
              <TableHead className="font-display font-semibold text-[hsl(240_15%_8%)]">Category</TableHead>
              <TableHead className="font-display font-semibold text-[hsl(240_15%_8%)]">Price</TableHead>
              <TableHead className="font-display font-semibold text-[hsl(240_15%_8%)]">Status</TableHead>
              <TableHead className="font-display font-semibold text-[hsl(240_15%_8%)] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center font-body text-[hsl(240_10%_45%)]">
                  No dishes found matching &quot;{search}&quot;.
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id} className="hover:bg-[hsl(252_60%_98%)] transition-colors">
                  {/* Emoji */}
                  <TableCell className="text-center text-2xl">{item.emoji}</TableCell>
                  
                  {/* Name & Desc */}
                  <TableCell>
                    <p className="font-display font-semibold text-[hsl(240_15%_8%)]">
                      {item.name}
                    </p>
                    <p className="font-body text-xs text-[hsl(240_10%_45%)] max-w-xs truncate">
                      {item.description}
                    </p>
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    <Badge variant="secondary" className="font-display capitalize text-[hsl(250_78%_60%)] bg-[hsl(250_78%_60%)/0.1] hover:bg-[hsl(250_78%_60%)/0.15]">
                      {item.category}
                    </Badge>
                  </TableCell>

                  {/* Price */}
                  <TableCell className="font-display font-medium text-[hsl(240_15%_8%)]">
                    £{item.price.toFixed(2)}
                  </TableCell>

                  {/* Status Toggle */}
                  <TableCell>
                    {/* Using a simple button toggle since shadcn <Switch> isn't installed yet, 
                        but this acts precisely like a toggle switch visually. */}
                    <button
                      onClick={() => toggleAvailable(item.id, item.available)}
                      className={[
                        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[hsl(250_78%_60%)] focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                        item.available ? "bg-[hsl(250_78%_60%)]" : "bg-[hsl(252_35%_85%)]"
                      ].join(" ")}
                      role="switch"
                      aria-checked={item.available}
                    >
                      <span className="sr-only">Toggle {item.name} availability</span>
                      <span
                        className={[
                          "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200",
                          item.available ? "translate-x-2" : "-translate-x-2"
                        ].join(" ")}
                      />
                    </button>
                    <span className="ml-3 font-body text-xs text-[hsl(240_10%_45%)]">
                      {item.available ? "Active" : "Disabled"}
                    </span>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="text-[hsl(240_10%_45%)] hover:text-[hsl(250_78%_60%)]">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-[hsl(240_10%_45%)] hover:text-[hsl(240_15%_8%)]">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
