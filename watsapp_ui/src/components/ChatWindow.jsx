import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { avatarColor, initials } from "./Sidebar";
import { API_BASE_URL } from "../config";

const ChatWindow = ({ username, selectedContact, messages = [], onSendMessage }) => {
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null); // { url, name, type }
  const bottomRef = useRef();
  const fileInputRef = useRef();

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, selectedContact?.id]);

  const sendMessage = () => {
    if (!input.trim() || !selectedContact) return;
    onSendMessage({ type: "text", content: input.trim() });
    setInput("");
  };

  // Handle file selection
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");

    // Show preview
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (ev) =>
        setPreview({ url: ev.target.result, name: file.name, type: "image" });
      reader.readAsDataURL(file);
    } else {
      setPreview({ url: null, name: file.name, type: "file" });
    }

    // Upload to backend
    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      // Send as message
      onSendMessage({
        type: isImage ? "image" : "file",
        content: file.name,
        mediaUrl: data.url,
        mediaPublicId: data.publicId,
        mediaName: data.name,
      });

      setPreview(null);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
      e.target.value = ""; // reset input
    }
  };

  // Empty state
  if (!selectedContact) {
    return (
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
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
        <Typography sx={{ fontSize: "0.9rem", color: "#A8A29E" }}>
          Select a conversation to start chatting
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: "#EDE8DF", fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <Box sx={{ p: "12px 20px", background: "#FDFCF9", borderBottom: "1px solid #E5E0D8", display: "flex", alignItems: "center", gap: 1.4 }}>
        <Box sx={{
          width: 38, height: 38, borderRadius: "50%",
          background: avatarColor(selectedContact.name),
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.85rem", fontWeight: 600, color: "#fff", position: "relative",
          ...(selectedContact.online && {
            "&::after": { content: '""', width: 9, height: 9, background: "#52B788", border: "2px solid #FDFCF9", borderRadius: "50%", position: "absolute", bottom: 1, right: 1 },
          }),
        }}>
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
          const senderName = m.sender?.username || m.from;
          const isSelf = senderName === username;
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

              <Box sx={{
                maxWidth: 320, p: "10px 14px", borderRadius: "14px",
                wordBreak: "break-word", overflowWrap: "break-word",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                background: isSelf ? "#C7F0D3" : "#FFFFFF",
                borderBottomRightRadius: isSelf ? "3px" : "14px",
                borderBottomLeftRadius: !isSelf ? "3px" : "14px",
              }}>

                {/* IMAGE MESSAGE */}
                {m.type === "image" && m.mediaUrl && (
                  <Box
                    component="img"
                    src={m.mediaUrl}
                    alt={m.mediaName || "image"}
                    sx={{ width: "100%", maxWidth: 260, borderRadius: "8px", mb: 0.5, cursor: "pointer" }}
                    onClick={() => window.open(m.mediaUrl, "_blank")}
                  />
                )}

                {/* FILE MESSAGE */}
                {m.type === "file" && (
                  <Box
                    onClick={() => window.open(m.mediaUrl, "_blank")}
                    sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer", p: "4px 0" }}
                  >
                    <Box sx={{ fontSize: "1.5rem" }}>📄</Box>
                    <Typography sx={{ fontSize: "0.82rem", color: "#1A1A1A", textDecoration: "underline" }}>
                      {m.mediaName || m.content || "File"}
                    </Typography>
                  </Box>
                )}

                {/* TEXT MESSAGE */}
                {m.type === "text" && (
                  <Typography sx={{ fontSize: "0.88rem", lineHeight: 1.55, color: "#1A1A1A" }}>
                    {text}
                  </Typography>
                )}

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

      {/* Upload preview */}
      {preview && (
        <Box sx={{ px: 2, py: 1, background: "#FDFCF9", borderTop: "1px solid #E5E0D8", display: "flex", alignItems: "center", gap: 1 }}>
          {preview.type === "image" ? (
            <Box component="img" src={preview.url} sx={{ height: 60, borderRadius: "8px" }} />
          ) : (
            <Typography sx={{ fontSize: "0.82rem" }}>📄 {preview.name}</Typography>
          )}
          {uploading && <CircularProgress size={18} />}
        </Box>
      )}

      {/* Input */}
      <Box sx={{ p: "12px 16px", background: "#FDFCF9", borderTop: "1px solid #E5E0D8", display: "flex", alignItems: "center", gap: 1 }}>

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
        />

        {/* Emoji btn */}
        <Box component="button" sx={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", lineHeight: 1, p: 0.3 }}>
          😊
        </Box>

        {/* 📎 Attach button */}
        <Box
          component="button"
          onClick={() => fileInputRef.current.click()}
          disabled={uploading}
          sx={{
            background: "none", border: "none", cursor: "pointer",
            p: 0.3, display: "flex", alignItems: "center", color: "#6B6660",
            "&:hover": { color: "#2D6A4F" },
          }}
        >
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
          </svg>
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
            flex: 1, padding: "10px 16px", background: "#F0ECE6",
            border: "none", borderRadius: "22px",
            fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem",
            color: "#1A1A1A", outline: "none", resize: "none",
            maxHeight: 80, lineHeight: 1.5,
          }}
        />

        {/* Send button */}
        <Box
          component="button"
          onClick={sendMessage}
          disabled={!input.trim() || uploading}
          sx={{
            width: 38, height: 38,
            background: input.trim() ? "#2D6A4F" : "#A8D5B8",
            border: "none", borderRadius: "50%",
            cursor: input.trim() ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, transition: "background 0.2s",
          }}
        >
          {uploading
            ? <CircularProgress size={16} sx={{ color: "#fff" }} />
            : <svg width={16} height={16} viewBox="0 0 24 24" fill="white"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
          }
        </Box>
      </Box>
    </Box>
  );
};

export default ChatWindow;