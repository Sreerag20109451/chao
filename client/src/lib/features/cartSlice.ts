import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MenuItem } from "@/lib/menuData";

export interface CartItem extends MenuItem {
  cartId: string; // Unique ID for each cart entry (same item with different options = different cartId)
  quantity: number;
  selectedProtein?: string;
  selectedSide?: string;
}

interface CartState {
  items: CartItem[];
  orderType: "delivery" | "collection";
}

const initialState: CartState = {
  items: [],
  orderType: "delivery",
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Omit<CartItem, "cartId" | "quantity">>) => {
      const { id, selectedProtein, selectedSide } = action.payload;
      
      const existingItem = state.items.find(
        (item) => 
          item.id === id && 
          item.selectedProtein === selectedProtein && 
          item.selectedSide === selectedSide
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        const cartId = `${id}-${selectedProtein || "none"}-${selectedSide || "none"}`;
        const newItem = { ...action.payload, cartId, quantity: 1 };
        // Strip non-serializable Firestore Timestamps
        delete (newItem as any).createdAt;
        delete (newItem as any).updatedAt;
        state.items.push(newItem);
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.cartId !== action.payload);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ cartId: string; quantity: number }>
    ) => {
      const item = state.items.find((item) => item.cartId === action.payload.cartId);
      if (item) {
        item.quantity = Math.max(0, action.payload.quantity);
        if (item.quantity === 0) {
          state.items = state.items.filter((i) => i.cartId !== action.payload.cartId);
        }
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
    setOrderType: (state, action: PayloadAction<"delivery" | "collection">) => {
      state.orderType = action.payload;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, setOrderType } = cartSlice.actions;
export default cartSlice.reducer;
