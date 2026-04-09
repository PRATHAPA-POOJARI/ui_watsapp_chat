import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { API_SEND_OTP, API_VERIFY_OTP } from "../../config";


// ===================== ASYNC THUNKS =====================

// Send OTP
export const sendOtp = createAsyncThunk(
  "otp/sendOtp",
  async ({ email, username }, { rejectWithValue }) => {
    try {
    const response = await fetch(API_SEND_OTP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || "Failed to send OTP");
      }

      return { data, email };
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);

// Verify OTP
export const verifyOtp = createAsyncThunk(
  "otp/verifyOtp",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await fetch(API_VERIFY_OTP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || "Invalid OTP");
      }

      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Server error");
    }
  }
);

// ===================== SLICE =====================
const otpSlice = createSlice({
  name: "otp",
  initialState: {
    loading: false,
    otpSent: false,
    verified: false,
    email: null,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.loading = false;
      state.otpSent = false;
      state.verified = false;
      state.email = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // SEND OTP
      .addCase(sendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.otpSent = true;
        state.email = action.payload.email;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // VERIFY OTP
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
  state.loading = false;
  state.verified = true;

  // 🔥 Save token + user to localStorage
  localStorage.setItem("token", action.payload.token);
  localStorage.setItem("user", JSON.stringify(action.payload.user));
})

      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, logout } = otpSlice.actions;
export default otpSlice.reducer;
