import React, { useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { avatarColor, initials } from "./Sidebar";

/* ─── ChatWindow ─────────────────────────────────────────── */
const ChatWindow = ({ username, selectedContact, socket }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef();

  /* Socket listener */
  useEffect(() => {
    if (!socket) return;
    const handler = (data) => setMessages((prev) => [...prev, data]);
    socket.on("receive_message", handler);
    return () => socket.off("receive_message", handler);
  }, [socket]);

  /* Auto-scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, selectedContact?.id]);

  const sendMessage = () => {
    if (!input.trim() || !selectedContact) return;
    const data = {
      from: username,
      to: selectedContact.id,
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    socket?.emit("send_message", data);
    setMessages((prev) => [...prev, data]);
    setInput("");
  };

  const visible = messages.filter(
    (m) =>
      (m.from === username && m.to === selectedContact?.id) ||
      (m.from === selectedContact?.id && m.to === username)
  );

  /* Empty state */
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
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap"
        rel="stylesheet"
      />

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: "#EDE8DF",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: "12px 20px",
            background: "#FDFCF9",
            borderBottom: "1px solid #E5E0D8",
            display: "flex",
            alignItems: "center",
            gap: 1.4,
          }}
        >
          {/* Contact avatar */}
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: avatarColor(selectedContact.name),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "#fff",
              position: "relative",
              ...(selectedContact.online && {
                "&::after": {
                  content: '""',
                  width: 9,
                  height: 9,
                  background: "#52B788",
                  border: "2px solid #FDFCF9",
                  borderRadius: "50%",
                  position: "absolute",
                  bottom: 1,
                  right: 1,
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

          {/* Header actions */}
          {[
            <path key="phone" d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.3 11.5a19.79 19.79 0 01-3.07-8.67A2 2 0 013.21 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.91 8.09a16 16 0 006 6l.56-.56a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />,
            <><circle key="vc1" cx={12} cy={12} r={3} /><path key="vc2" d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" /></>,
          ].map((icon, i) => (
            <Box
              key={i}
              component="button"
              sx={{
                background: "none",
                border: "none",
                cursor: "pointer",
                p: 0.5,
                borderRadius: "6px",
                color: "#6B6660",
                display: "flex",
                "&:hover": { color: "#1A1A1A" },
              }}
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                {icon}
              </svg>
            </Box>
          ))}
        </Box>

        {/* Messages */}
        <Box sx={{ flex: 1, overflowY: "auto", p: "16px 20px", display: "flex", flexDirection: "column", gap: 1 }}>
          {/* Date divider */}
          <Box sx={{ textAlign: "center", my: 0.5 }}>
            <Box
              component="span"
              sx={{
                background: "rgba(0,0,0,0.07)",
                fontSize: "0.72rem",
                color: "#6B6660",
                px: 1.5,
                py: 0.3,
                borderRadius: "20px",
              }}
            >
              Today
            </Box>
          </Box>

          {visible.map((m, i) => {
            const isSelf = m.from === username;
            return (
              <Box key={i} sx={{ display: "flex", justifyContent: isSelf ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 0.8 }}>
                {/* Other avatar */}
                {!isSelf && (
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: avatarColor(selectedContact.name),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    {initials(selectedContact.name)}
                  </Box>
                )}

                {/* Bubble */}
                <Box
                  sx={{
                    maxWidth: 320,
                    p: "10px 14px",
                    borderRadius: "14px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    background: isSelf ? "#C7F0D3" : "#FFFFFF",
                    borderBottomRightRadius: isSelf ? "3px" : "14px",
                    borderBottomLeftRadius: !isSelf ? "3px" : "14px",
                  }}
                >
                  <Typography sx={{ fontSize: "0.88rem", lineHeight: 1.55, color: "#1A1A1A" }}>
                    {m.text}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5, mt: 0.4 }}>
                    <Typography sx={{ fontSize: "0.68rem", color: "#A8A29E" }}>{m.time}</Typography>
                    {isSelf && (
                      <Typography sx={{ fontSize: "0.7rem", color: "#52B788" }}>✓✓</Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })}
          <div ref={bottomRef} />
        </Box>

        {/* Input area */}
        <Box
          sx={{
            p: "12px 16px",
            background: "#FDFCF9",
            borderTop: "1px solid #E5E0D8",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {/* Emoji btn */}
          <Box component="button" sx={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", lineHeight: 1, p: 0.3 }}>
            😊
          </Box>

          {/* Text input */}
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
              flex: 1,
              padding: "10px 16px",
              background: "#F0ECE6",
              border: "none",
              borderRadius: "22px",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.88rem",
              color: "#1A1A1A",
              outline: "none",
              resize: "none",
              maxHeight: 80,
              lineHeight: 1.5,
            }}
          />

          {/* Send button */}
          <Box
            component="button"
            onClick={sendMessage}
            disabled={!input.trim()}
            sx={{
              width: 38,
              height: 38,
              background: input.trim() ? "#2D6A4F" : "#A8D5B8",
              border: "none",
              borderRadius: "50%",
              cursor: input.trim() ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "background 0.2s",
              "&:hover": { background: input.trim() ? "#245A40" : "#A8D5B8" },
            }}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="white">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default ChatWindow;