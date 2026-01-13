import React, { useState } from "react";
import { Box, Paper, TextField, Button, Typography } from "@mui/material";

const Login = ({ setUsername }) => {
  const [name, setName] = useState("");

  const handleLogin = () => {
    if (!name.trim()) return;
    setUsername(name);
  };

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
          WhatsApp Messenger
        </Typography>

        <TextField
          fullWidth
          margin="normal"
          label="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Button variant="contained" fullWidth onClick={handleLogin}>
          Login
        </Button>
      </Paper>
    </Box>
  );
};

export default Login;
