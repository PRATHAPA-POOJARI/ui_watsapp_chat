import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Paper, TextField, Button, Typography, CircularProgress } from "@mui/material";
import { sendOtp, verifyOtp } from "../Redux/slices/otpSlice";
import { loginUser } from "../Redux/slices/authSlice";
import { logout as otpLogout } from "../Redux/slices/otpSlice";


import ChatWindow from "./ChatWindow"; // Make sure you have this component

const Login = () => {
  const dispatch = useDispatch();
  const otpState = useSelector((state) => state.otp);
  const authState = useSelector((state) => state.auth);

  const { otpSent, verified, loading, error, email } = otpState;
  const { user, isAuthenticated } = authState;

  const [formUsername, setFormUsername] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [otp, setOtp] = useState("");

  // STEP 1: Send OTP
  const handleSendOtp = () => {
    if (!formUsername.trim() || !formEmail.trim()) return;
    dispatch(sendOtp({ username: formUsername.trim(), email: formEmail.trim() }));
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp.trim()) return;

    const resultAction = await dispatch(verifyOtp({ email, otp }));
    if (verifyOtp.fulfilled.match(resultAction)) {
      // OTP verified → log in the user
      dispatch(loginUser({ username: formUsername.trim(), email }));
    }
  };

  // STEP 3: Logout / Reset
  const handleLogout = () => {
    dispatch(otpLogout());
    setFormEmail("");
    setFormUsername("");
    setOtp("");
  };

  // === UI ===
  if (isAuthenticated && user) {
    return <ChatWindow username={user.username} />;
  }

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#E0F2F1",
      }}
    >
      <Paper sx={{ p: 4, width: 350, textAlign: "center" }} elevation={3}>
        <Typography variant="h6" gutterBottom>
          {otpSent ? "Enter OTP" : "Register / Login"}
        </Typography>

        {/* Step 1: Register form */}
        {!otpSent && (
          <>
            <TextField
              fullWidth
              margin="normal"
              label="Username"
              value={formUsername}
              onChange={(e) => setFormUsername(e.target.value)}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              type="email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
            />
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleSendOtp}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Send OTP"}
            </Button>
          </>
        )}

        {/* Step 2: OTP input */}
        {otpSent && !verified && (
          <>
            <TextField
              fullWidth
              margin="normal"
              label="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Verify OTP"}
            </Button>
            <Button
              variant="text"
              fullWidth
              sx={{ mt: 1 }}
              onClick={handleLogout}
            >
              Cancel / Back
            </Button>
          </>
        )}

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default Login;
