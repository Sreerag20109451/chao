import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Order {
  id: string;
  date: string;
  total: number;
  status: "delivered" | "processing" | "cancelled";
  items: { name: string; quantity: number; price: number }[];
  orderType: "delivery" | "collection";
}

export interface PaymentMethod {
  id: string;
  type: "visa" | "mastercard" | "apple-pay" | "cash";
  last4?: string;
  isPrimary: boolean;
}

export interface User {
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
  user: {
    name: "Sreerag Sathian",
    email: "sreerag@example.com",
    phone: "+353 87 123 4567",
    addresses: ["8 O'Connell St, Waterford City, X91 CH61"],
    primaryAddressIndex: 0,
    orders: [
      {
        id: "CH-8821",
        date: "2024-04-20",
        total: 42.50,
        status: "delivered",
        orderType: "delivery",
        items: [
          { name: "Pad Thai", quantity: 2, price: 14.50 },
          { name: "Thai Green Curry", quantity: 1, price: 13.50 }
        ]
      },
      {
        id: "CH-7912",
        date: "2024-03-15",
        total: 28.00,
        status: "delivered",
        orderType: "collection",
        items: [
          { name: "Massaman Curry", quantity: 2, price: 14.00 }
        ]
      }
    ],
    paymentMethods: [
      { id: "pm-1", type: "visa", last4: "4242", isPrimary: true },
      { id: "pm-2", type: "mastercard", last4: "8888", isPrimary: false }
    ]
  },
  isAuthenticated: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ name: string; email: string }>
    ) => {
      state.user = {
        ...action.payload,
        addresses: [],
        primaryAddressIndex: 0,
        orders: [],
        paymentMethods: []
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
  },
});

export const { setCredentials, logout, addAddress, setPrimaryAddress, removeAddress, updateProfile } = authSlice.actions;
export default authSlice.reducer;
