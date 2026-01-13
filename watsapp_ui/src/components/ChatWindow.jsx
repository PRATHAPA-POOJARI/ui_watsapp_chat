import React, { useEffect, useState } from "react";
import { Box, AppBar, Toolbar, Typography, Paper, TextField, Button } from "@mui/material";

const ChatWindow = ({ username, selectedUser, socket }) => {
  const [message, setMessage] = useState("");          // current input
  const [messages, setMessages] = useState([]);        // chat history

  useEffect(() => {
    if (!socket) return;

    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => socket.off("receive_message");
  }, [socket]);

  const sendMessage = () => {
    if (!message.trim() || !selectedUser) return;

    const data = {
      from: username,
      to: selectedUser,
      text: message,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    socket.emit("send_message", data);
    setMessages((prev) => [...prev, data]); // show instantly on self
    setMessage("");
  };

  return (
    <Box flex={1} display="flex" flexDirection="column">
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6">
            {selectedUser ? selectedUser : "Select a chat"}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box flex={1} p={2} display="flex" flexDirection="column" gap={1} overflow="auto" bgcolor="#ECE5DD">
        {messages
          .filter(
            (m) =>
              (m.from === username && m.to === selectedUser) ||
              (m.from === selectedUser && m.to === username)
          )
          .map((m, i) => (
            <Box key={i} alignSelf={m.from === username ? "flex-end" : "flex-start"}>
              <Paper
                sx={{
                  p: 1,
                  maxWidth: 300,
                  bgcolor: m.from === username ? "#DCF8C6" : "white",
                }}
              >
                <Typography variant="subtitle2">{m.from}</Typography>
                <Typography>{m.text}</Typography>
                <Typography variant="caption">{m.time}</Typography>
              </Paper>
            </Box>
          ))}
      </Box>

      <Box p={2} display="flex" gap={1}>
        <TextField
          fullWidth
          label="Type message"
          value={message}
          disabled={!selectedUser}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button variant="contained" onClick={sendMessage} disabled={!selectedUser}>
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default ChatWindow;
