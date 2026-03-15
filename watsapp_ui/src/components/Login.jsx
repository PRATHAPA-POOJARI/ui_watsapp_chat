import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Paper, Typography, CircularProgress } from "@mui/material";
import { sendOtp, verifyOtp } from "../Redux/slices/otpSlice";
import { loginUser } from "../Redux/slices/authSlice";
import { logout as otpLogout } from "../Redux/slices/otpSlice";
import ChatApp from "./Chatapp";

/* ─── colour tokens ─────────────────────────────────────── */
const C = {
  bg: "#F7F4EF",
  white: "#FFFFFF",
  green: "#2D6A4F",
  greenLight: "#52B788",
  border: "#E5E0D8",
  text: "#1A1A1A",
  muted: "#6B6660",
  faint: "#A8A29E",
  danger: "#C0392B",
};

/* ─── shared input style ─────────────────────────────────── */
const inputSx = {
  width: "100%",
  padding: "10px 14px",
  border: `1px solid ${C.border}`,
  borderRadius: "8px",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "0.9rem",
  color: C.text,
  background: "#FDFCF9",
  outline: "none",
  display: "block",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

/* ─── Reusable field ─────────────────────────────────────── */
const Field = ({ label, ...props }) => (
  <Box mb={1.8}>
    <Box
      component="label"
      sx={{
        display: "block",
        fontSize: "0.72rem",
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: C.muted,
        mb: 0.6,
      }}
    >
      {label}
    </Box>
    <input style={inputSx} {...props} />
  </Box>
);

/* ─── Primary button ─────────────────────────────────────── */
const PrimaryBtn = ({ children, loading, ...props }) => (
  <button
    style={{
      width: "100%",
      padding: "12px",
      background: props.disabled ? "#A8D5B8" : C.green,
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "0.9rem",
      fontWeight: 500,
      cursor: props.disabled ? "default" : "pointer",
      marginTop: "6px",
      transition: "background 0.2s",
    }}
    {...props}
  >
    {loading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : children}
  </button>
);

/* ─── Ghost button ───────────────────────────────────────── */
const GhostBtn = ({ children, ...props }) => (
  <button
    style={{
      width: "100%",
      padding: "10px",
      background: "none",
      border: `1px solid ${C.border}`,
      borderRadius: "8px",
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "0.85rem",
      color: C.muted,
      cursor: "pointer",
      marginTop: "8px",
    }}
    {...props}
  >
    {children}
  </button>
);

/* ─── Login ──────────────────────────────────────────────── */
const Login = () => {
  const dispatch = useDispatch();
  const { otpSent, verified, loading, error, email } = useSelector((s) => s.otp);
  const { user, isAuthenticated } = useSelector((s) => s.auth);

  const [formUsername, setFormUsername] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);

  /* OTP digit change + auto-advance */
  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKey = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const handleSendOtp = () => {
    if (!formUsername.trim() || !formEmail.trim()) return;
    dispatch(sendOtp({ username: formUsername.trim(), email: formEmail.trim() }));
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length < 6) return;
    const result = await dispatch(verifyOtp({ email, otp: code }));
    if (verifyOtp.fulfilled.match(result)) {
      dispatch(loginUser({ username: formUsername.trim(), email }));
    }
  };

  const handleBack = () => {
    dispatch(otpLogout());
    setFormEmail("");
    setFormUsername("");
    setOtp(["", "", "", "", "", ""]);
  };

  if (isAuthenticated && user) return <ChatApp username={user.username} />;

  return (
    <>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@500&display=swap"
        rel="stylesheet"
      />

      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #F0ECE5 0%, #E8E2D8 100%)",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 4,
            width: 360,
            borderRadius: "20px",
            border: `1px solid ${C.border}`,
            boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
          }}
        >
          {/* Logo */}
          <Box
            sx={{
              width: 48,
              height: 48,
              background: C.green,
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <svg width={24} height={24} viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.38 5.07L2 22l5.06-1.35C8.47 21.52 10.2 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm5 13.59l-1.41 1.41c-.2.2-.47.31-.75.29A12.4 12.4 0 018.7 15.3a12.4 12.4 0 01-2-3.14.97.97 0 01.29-.75l1.41-1.41c.38-.38 1-.38 1.38 0l1.06 1.06c.38.38.38 1 0 1.38l-.5.5c.34.65.8 1.26 1.36 1.82.56.56 1.17 1.02 1.82 1.36l.5-.5c.38-.38 1-.38 1.38 0l1.06 1.06c.39.38.39 1.01 0 1.41z" />
            </svg>
          </Box>

          {!otpSent ? (
            <>
              <Typography
                sx={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", mb: 0.4 }}
              >
                Welcome back
              </Typography>
              <Typography sx={{ fontSize: "0.85rem", color: C.muted, mb: 2.5, lineHeight: 1.6 }}>
                Sign in to continue your conversations
              </Typography>

              <Field
                label="Username"
                placeholder="Your name"
                value={formUsername}
                onChange={(e) => setFormUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
              />
              <Field
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
              />

              <PrimaryBtn loading={loading} disabled={loading} onClick={handleSendOtp}>
                Send OTP
              </PrimaryBtn>
            </>
          ) : (
            <>
              <Typography
                sx={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", mb: 0.4 }}
              >
                Verify email
              </Typography>
              <Typography sx={{ fontSize: "0.85rem", color: C.muted, mb: 2.5, lineHeight: 1.6 }}>
                We sent a 6-digit code to {email}
              </Typography>

              {/* OTP boxes */}
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    maxLength={1}
                    value={d}
                    autoFocus={i === 0}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKey(i, e)}
                    style={{
                      ...inputSx,
                      textAlign: "center",
                      fontSize: "1.2rem",
                      fontWeight: 500,
                      padding: "12px 4px",
                    }}
                  />
                ))}
              </Box>

              <PrimaryBtn loading={loading} disabled={loading} onClick={handleVerifyOtp}>
                Verify &amp; Sign in
              </PrimaryBtn>
              <GhostBtn onClick={handleBack}>← Use a different email</GhostBtn>
            </>
          )}

          {error && (
            <Typography sx={{ color: C.danger, fontSize: "0.8rem", mt: 1.5, textAlign: "center" }}>
              {error}
            </Typography>
          )}
        </Paper>
      </Box>
    </>
  );
};

export default Login;