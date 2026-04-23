import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: {
    name: string;
    email: string;
  } | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: {
    name: "Sreerag Sathian",
    email: "sreerag@example.com"
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
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
