import { createSlice } from "@reduxjs/toolkit";
import { verifyOtp } from "./otpSlice";

// Load persisted state from localStorage
const savedUser = localStorage.getItem("user");
const savedToken = localStorage.getItem("token");

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: savedUser ? JSON.parse(savedUser) : null,
    token: savedToken || null,
    isAuthenticated: !!savedToken,
  },
  reducers: {
    loginUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
  // Auto-login when verifyOtp succeeds
  extraReducers: (builder) => {
    builder.addCase(verifyOtp.fulfilled, (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    });
  },
});

export const { loginUser, logoutUser } = authSlice.actions;
export default authSlice.reducer;