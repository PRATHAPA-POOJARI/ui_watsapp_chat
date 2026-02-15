import { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useDispatch } from "react-redux";
import { loginUser } from "../Redux/slices/authSlice";


const Login = () => {
  const [name, setName] = useState("");
  const dispatch = useDispatch();

  const handleLogin = () => {
    if (!name.trim()) return;

    // Dispatch Redux login action
    dispatch(loginUser({ username: name.trim() }));

    // Optionally, clear input
    setName("");
  };

  return (
    <Box
      height="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        width={300}
        p={3}
        boxShadow={3}
        borderRadius={2}
        textAlign="center"
      >
        <Typography variant="h5" mb={2}>
          Login
        </Typography>

        <TextField
          fullWidth
          label="Username"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
        />

        <Button
          fullWidth
          variant="contained"
          onClick={handleLogin}
          sx={{ mt: 2 }}
        >
          Enter Chat
        </Button>
      </Box>
    </Box>
  );
};

export default Login;
