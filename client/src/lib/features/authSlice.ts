import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
  name: string;
  email: string;
  phone?: string;
  addresses: string[];
  primaryAddressIndex: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: {
    name: "Sreerag Sathian",
    email: "sreerag@example.com",
    phone: "",
    addresses: [],
    primaryAddressIndex: 0,
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
      state.user = action.payload;
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
