import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { StripeBillingInfo } from "@/models/billing";

export interface Order {
  id: string;
  date: string;
  createdAt?: string;
  total: number;
  status: "pending" | "preparing" | "ready" | "delivered" | "cancelled";
  items: { name: string; quantity: number; price: number }[];
  orderType: "delivery" | "collection";
}

export interface PaymentMethod {
  id: string;
  type: "visa" | "mastercard" | "apple-pay" | "cash";
  last4?: string;
  isPrimary: boolean;
}

export interface User extends StripeBillingInfo {
  name: string;
  email: string;
  phone?: string;
  addresses: string[];
  primaryAddressIndex: number;
  orders: Order[];
  paymentMethods: PaymentMethod[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<
        StripeBillingInfo & {
          name: string;
          email: string;
          phone?: string;
          addresses?: string[];
          primaryAddressIndex?: number;
        }
      >
    ) => {
      state.user = {
        ...action.payload,
        addresses: action.payload.addresses || [],
        primaryAddressIndex: action.payload.primaryAddressIndex || 0,
        orders: [],
        paymentMethods: [],
      };
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    addAddress: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.addresses.push(action.payload);
        if (state.user.addresses.length === 1) {
          state.user.primaryAddressIndex = 0;
        }
      }
    },
    setPrimaryAddress: (state, action: PayloadAction<number>) => {
      if (state.user) {
        state.user.primaryAddressIndex = action.payload;
      }
    },
    removeAddress: (state, action: PayloadAction<number>) => {
      if (state.user) {
        state.user.addresses = state.user.addresses.filter((_, i) => i !== action.payload);
        if (state.user.primaryAddressIndex >= state.user.addresses.length) {
          state.user.primaryAddressIndex = Math.max(0, state.user.addresses.length - 1);
        }
      }
    },
    updateProfile: (state, action: PayloadAction<{ name?: string; email?: string; phone?: string }>) => {
      if (state.user) {
        if (action.payload.name) state.user.name = action.payload.name;
        if (action.payload.email) state.user.email = action.payload.email;
        if (action.payload.phone) state.user.phone = action.payload.phone;
      }
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      if (state.user) {
        state.user.orders.unshift(action.payload);
      }
    },
    updateStripeBilling: (state, action: PayloadAction<Partial<StripeBillingInfo>>) => {
      if (!state.user) return;
      const { stripeCustomerId, stripeCardLast4, stripeCardBrand } = action.payload;
      if (stripeCustomerId !== undefined) state.user.stripeCustomerId = stripeCustomerId;
      if (stripeCardLast4 !== undefined) state.user.stripeCardLast4 = stripeCardLast4;
      if (stripeCardBrand !== undefined) state.user.stripeCardBrand = stripeCardBrand;
    },
  },
});

export const {
  setCredentials,
  logout,
  addAddress,
  setPrimaryAddress,
  removeAddress,
  updateProfile,
  addOrder,
  updateStripeBilling,
} = authSlice.actions;
export default authSlice.reducer;
