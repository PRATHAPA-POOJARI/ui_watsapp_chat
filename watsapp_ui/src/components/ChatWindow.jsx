import React, { useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { avatarColor, initials } from "./Sidebar";

const ChatWindow = ({ username, selectedContact, messages = [], onSendMessage }) => {
  const [input, setInput] = useState("");
  const bottomRef = useRef();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, selectedContact?.id]);

  const sendMessage = () => {
    if (!input.trim() || !selectedContact) return;
    onSendMessage(input.trim());
    setInput("");
  };

  // Empty state — no contact selected
  if (!selectedContact) {
    return (
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#EDE8DF",
          gap: 1.5,
          color: "#A8A29E",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <svg width={52} height={52} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} opacity={0.35}>
          <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.97-4.03 9-9 9a9 9 0 01-4.39-1.14L3 21l1.14-4.61A9 9 0 113 12c0 4.97 4.03 9 9 9" />
        </svg>
        <Typography sx={{ fontSize: "0.9rem", color: "#A8A29E", fontFamily: "'DM Sans', sans-serif" }}>
          Select a conversation to start chatting
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", background: "#EDE8DF", fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <Box sx={{ p: "12px 20px", background: "#FDFCF9", borderBottom: "1px solid #E5E0D8", display: "flex", alignItems: "center", gap: 1.4 }}>
        <Box
          sx={{
            width: 38, height: 38, borderRadius: "50%",
            background: avatarColor(selectedContact.name),
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.85rem", fontWeight: 600, color: "#fff",
            position: "relative",
            ...(selectedContact.online && {
              "&::after": {
                content: '""', width: 9, height: 9,
                background: "#52B788", border: "2px solid #FDFCF9",
                borderRadius: "50%", position: "absolute", bottom: 1, right: 1,
              },
            }),
          }}
        >
          {initials(selectedContact.name)}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: "0.95rem", fontWeight: 500, color: "#1A1A1A" }}>
            {selectedContact.name}
          </Typography>
          {selectedContact.online && (
            <Typography sx={{ fontSize: "0.75rem", color: "#52B788" }}>Online</Typography>
          )}
        </Box>
      </Box>

      {/* Messages */}
      <Box sx={{ flex: 1, overflowY: "auto", p: "16px 20px", display: "flex", flexDirection: "column", gap: 1 }}>
        <Box sx={{ textAlign: "center", my: 0.5 }}>
          <Box component="span" sx={{ background: "rgba(0,0,0,0.07)", fontSize: "0.72rem", color: "#6B6660", px: 1.5, py: 0.3, borderRadius: "20px" }}>
            Today
          </Box>
        </Box>

        {messages.map((m, i) => {
          // Support both old socket format and new DB format
          const senderId = m.sender?._id || m.sender;
          const senderName = m.sender?.username || m.from;
          const isSelf = senderName === username || senderId === undefined;
          const text = m.content || m.text;
          const time = m.createdAt
            ? new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : m.time || "";

          return (
            <Box key={m._id || i} sx={{ display: "flex", justifyContent: isSelf ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 0.8 }}>
              {!isSelf && (
                <Box sx={{ width: 28, height: 28, borderRadius: "50%", background: avatarColor(selectedContact.name), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 600, color: "#fff", flexShrink: 0 }}>
                  {initials(selectedContact.name)}
                </Box>
              )}
              <Box
                sx={{
                  maxWidth: 320, p: "10px 14px", borderRadius: "14px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  background: isSelf ? "#C7F0D3" : "#FFFFFF",
                  borderBottomRightRadius: isSelf ? "3px" : "14px",
                  borderBottomLeftRadius: !isSelf ? "3px" : "14px",
                }}
              >
                <Typography sx={{ fontSize: "0.88rem", lineHeight: 1.55, color: "#1A1A1A" }}>
                  {text}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5, mt: 0.4 }}>
                  <Typography sx={{ fontSize: "0.68rem", color: "#A8A29E" }}>{time}</Typography>
                  {isSelf && <Typography sx={{ fontSize: "0.7rem", color: "#52B788" }}>✓✓</Typography>}
                </Box>
              </Box>
            </Box>
          );
        })}
        <div ref={bottomRef} />
      </Box>

      {/* Input */}
      <Box sx={{ p: "12px 16px", background: "#FDFCF9", borderTop: "1px solid #E5E0D8", display: "flex", alignItems: "center", gap: 1 }}>
        <Box component="button" sx={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", lineHeight: 1, p: 0.3 }}>
          😊
        </Box>
        <Box
          component="textarea"
          rows={1}
          placeholder="Type a message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          sx={{
            flex: 1, padding: "10px 16px", background: "#F0ECE6",
            border: "none", borderRadius: "22px",
            fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem",
            color: "#1A1A1A", outline: "none", resize: "none",
            maxHeight: 80, lineHeight: 1.5,
          }}
        />
        <Box
          component="button"
          onClick={sendMessage}
          disabled={!input.trim()}
          sx={{
            width: 38, height: 38,
            background: input.trim() ? "#2D6A4F" : "#A8D5B8",
            border: "none", borderRadius: "50%",
            cursor: input.trim() ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, transition: "background 0.2s",
          }}
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="white">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatWindow;