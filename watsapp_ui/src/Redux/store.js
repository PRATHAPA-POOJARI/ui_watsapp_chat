import { configureStore } from "@reduxjs/toolkit";
import otpReducer from "./slices/otpSlice";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    otp: otpReducer,
    auth: authReducer,
  },
});



