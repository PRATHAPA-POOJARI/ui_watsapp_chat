import React, { useState } from "react";
import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";

/*
  ChatApp — root layout that wires Sidebar + ChatWindow.
  Props:
    username  – logged-in user's name (from Redux auth)
    socket    – socket.io client instance (pass down from your socket initialisation)
    contacts  – optional array of contact objects; falls back to DEMO_CONTACTS
*/

const DEMO_CONTACTS = [
  { id: "rahul",  name: "Rahul",  preview: "See you tomorrow!",    time: "10:32",   unread: 2, online: true  },
  { id: "sneha",  name: "Sneha",  preview: "Thanks for the files", time: "9:15",    unread: 0, online: true  },
  { id: "amit",   name: "Amit",   preview: "Can we reschedule?",   time: "Yesterday",unread: 1, online: false },
  { id: "priya",  name: "Priya",  preview: "Great work today 🎉",  time: "Yesterday",unread: 0, online: false },
  { id: "john",   name: "John",   preview: "Ping me when free",    time: "Mon",     unread: 0, online: false },
];

const ChatApp = ({ username, socket, contacts = DEMO_CONTACTS }) => {
  const [selectedId, setSelectedId] = useState(null);
  const selectedContact = contacts.find((c) => c.id === selectedId) ?? null;

  const handleLogout = () => {
    /* hook into your Redux dispatch here if needed */
    window.location.reload();
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap"
        rel="stylesheet"
      />
      <Box sx={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: "'DM Sans', sans-serif" }}>
        <Sidebar
          username={username}
          contacts={contacts}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onLogout={handleLogout}
        />
        <ChatWindow
          username={username}
          selectedContact={selectedContact}
          socket={socket}
        />
      </Box>
    </>
  );
};

export default ChatApp;