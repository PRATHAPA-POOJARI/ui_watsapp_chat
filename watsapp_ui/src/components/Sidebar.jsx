import React from "react";
import { Box, Typography } from "@mui/material";

/* ─── helpers ────────────────────────────────────────────── */
const AVATAR_COLORS = ["#2D6A4F", "#4A7C59", "#1B4332", "#386641", "#52796F"];
export const avatarColor = (name) =>
  AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];
export const initials = (name) => name?.charAt(0)?.toUpperCase() ?? "?";

/* ─── Avatar ─────────────────────────────────────────────── */
const Avatar = ({ name, size = 36, online = false }) => (
  <Box
    sx={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: avatarColor(name),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: size * 0.38,
      fontWeight: 600,
      color: "#fff",
      flexShrink: 0,
      position: "relative",
      "&::after": online
        ? {
            content: '""',
            width: 9,
            height: 9,
            background: "#52B788",
            border: "2px solid #FDFCF9",
            borderRadius: "50%",
            position: "absolute",
            bottom: 1,
            right: 1,
          }
        : {},
    }}
  >
    {initials(name)}
  </Box>
);

/* ─── Sidebar ────────────────────────────────────────────── */
const Sidebar = ({ username, contacts = [], selectedId, onSelect, onLogout }) => (
  <>
    <link
      href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap"
      rel="stylesheet"
    />

    <Box
      sx={{
        width: 300,
        minWidth: 300,
        background: "#FDFCF9",
        borderRight: "1px solid #E5E0D8",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: "14px 16px",
          borderBottom: "1px solid #E5E0D8",
          display: "flex",
          alignItems: "center",
          gap: 1.2,
        }}
      >
        <Avatar name={username} size={36} online />
        <Typography sx={{ flex: 1, fontSize: "0.9rem", fontWeight: 500, color: "#1A1A1A" }}>
          {username}
        </Typography>
        {/* Logout */}
        <Box
          component="button"
          onClick={onLogout}
          title="Sign out"
          sx={{
            background: "none",
            border: "none",
            cursor: "pointer",
            p: 0.4,
            borderRadius: "6px",
            color: "#A8A29E",
            display: "flex",
            "&:hover": { color: "#6B6660" },
          }}
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
        </Box>
      </Box>

      {/* Search */}
      <Box sx={{ p: "10px 14px", borderBottom: "1px solid #E5E0D8" }}>
        <Box
          component="input"
          placeholder="Search conversations…"
          sx={{
            width: "100%",
            padding: "8px 14px",
            background: "#F0ECE6",
            border: "none",
            borderRadius: "20px",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.85rem",
            color: "#1A1A1A",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </Box>

      {/* Section label */}
      <Typography
        sx={{
          p: "10px 16px 5px",
          fontSize: "0.7rem",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#A8A29E",
        }}
      >
        Messages
      </Typography>

      {/* Contact list */}
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {contacts.map((c) => (
          <Box
            key={c.id}
            onClick={() => onSelect(c.id)}
            sx={{
              p: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              cursor: "pointer",
              background: selectedId === c.id ? "#E8F5EE" : "transparent",
              transition: "background 0.15s",
              "&:hover": { background: selectedId === c.id ? "#E8F5EE" : "#F2EEE8" },
            }}
          >
            <Avatar name={c.name} size={40} online={c.online} />

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: "0.9rem", fontWeight: 500, color: "#1A1A1A" }}>
                {c.name}
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.78rem",
                  color: "#A8A29E",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {c.preview}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.5 }}>
              <Typography sx={{ fontSize: "0.7rem", color: "#A8A29E" }}>{c.time}</Typography>
              {c.unread > 0 && (
                <Box
                  sx={{
                    background: "#2D6A4F",
                    color: "#fff",
                    borderRadius: "10px",
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    px: 0.7,
                    py: 0.1,
                    minWidth: 18,
                    textAlign: "center",
                  }}
                >
                  {c.unread}
                </Box>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  </>
);

export default Sidebar;

dqj