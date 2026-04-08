import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../Redux/slices/authSlice";
import { logout as otpLogout } from "../Redux/slices/otpSlice";
import { initSocket, disconnectSocket } from "../socket/socket";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import { API_SEARCH_USERS, API_CREATE_CHAT, API_GET_MESSAGES, API_SEND_MESSAGE } from "../config";
const ChatApp = ({ username }) => {
  const dispatch = useDispatch();
  const { token, user } = useSelector((s) => s.auth);

  const [socket, setSocket]                   = useState(null);
  const [contacts, setContacts]               = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [activeChatId, setActiveChatId]       = useState(null);
  const [messages, setMessages]               = useState([]);

  // 1. Init socket
  useEffect(() => {
    if (!token) return;
    const s = initSocket(token);
    setSocket(s);
    return () => disconnectSocket();
  }, [token]);

  // 2. Load all users into sidebar
  useEffect(() => {
    if (!token) return;
    const fetchUsers = async () => {
      try {
       const res = await fetch(`${API_SEARCH_USERS}?query=`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          // Filter out current user from contacts list
          const otherUsers = data.filter((u) => u._id !== user?.id);
          setContacts(otherUsers.map((u) => ({
            id: u._id,
            name: u.username,
            email: u.email,
            preview: "Tap to chat",
            time: "",
            unread: 0,
            online: false,
          })));
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };
    fetchUsers();
  }, [token, user?.id]);

  // 3. Track online/offline status
  useEffect(() => {
    if (!socket) return;
    socket.on("user_online", ({ userId }) => {
      setContacts((prev) =>
        prev.map((c) => (c.id === userId ? { ...c, online: true } : c))
      );
    });
    socket.on("user_offline", ({ userId }) => {
      setContacts((prev) =>
        prev.map((c) => (c.id === userId ? { ...c, online: false } : c))
      );
    });
    return () => {
      socket.off("user_online");
      socket.off("user_offline");
    };
  }, [socket]);

  // 4. Receive incoming messages
  useEffect(() => {
    if (!socket) return;
    socket.on("receive_message", (msg) => {
      if (msg.chatId === activeChatId) {
        setMessages((prev) => [...prev, msg]);
      }
      // Update sidebar preview
      setContacts((prev) =>
        prev.map((c) =>
          c.id === (msg.sender?._id || msg.senderId)
            ? { ...c, preview: msg.content, time: "now" }
            : c
        )
      );
    });
    return () => socket.off("receive_message");
  }, [socket, activeChatId]);

  // 5. Select contact → open/create chat → load history
  const handleSelectContact = async (contactId) => {
    const contact = contacts.find((c) => c.id === contactId);
    if (!contact) return;
    setSelectedContact(contact);
    setMessages([]);

    try {
      // Get or create the chat between the two users
      // FIXED: Added missing colon after 5000
     const chatRes = await fetch(API_CREATE_CHAT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: contactId }),
      });
      const chat = await chatRes.json();
      const chatId = chat._id;
      setActiveChatId(chatId);

      // Join socket room so both users receive messages
      socket?.emit("join_chat", chatId);

      // Load message history from DB
      // FIXED: Added missing colon after 5000

      const msgRes = await fetch(API_GET_MESSAGES(chatId), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const history = await msgRes.json();
      if (Array.isArray(history)) setMessages(history);
    } catch (err) {
      console.error("Failed to open chat:", err);
    }
  };
  // 6. Send a message
  const handleSendMessage = async (content) => {
    if (!content.trim() || !activeChatId) return;

    // Optimistic UI — show immediately
    const tempMsg = {
      _id: `temp_${Date.now()}`,
      chatId: activeChatId,
      content,
      sender: { _id: user?.id, username: user?.username },
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      // Save to MongoDB
      // FIXED: Added missing colon after 5000
      const res = await fetch(API_SEND_MESSAGE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ chatId: activeChatId, content }),
      });
      const saved = await res.json();

      // Replace temp message with real saved one
      setMessages((prev) =>
        prev.map((m) => (m._id === tempMsg._id ? saved : m))
      );

      // Emit to other user via socket
      socket?.emit("send_message", { ...saved, chatId: activeChatId });

      // Update sidebar preview
      setContacts((prev) =>
        prev.map((c) =>
          c.id === selectedContact?.id
            ? { ...c, preview: content, time: "now" }
            : c
        )
      );
    } catch (err) {
      console.error("Failed to send:", err);
    }
  };

  // 7. Logout
  const handleLogout = () => {
    disconnectSocket();
    dispatch(logoutUser());
    dispatch(otpLogout());
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap"
        rel="stylesheet"
      />
      <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <Sidebar
          username={username}
          contacts={contacts}
          selectedId={selectedContact?.id}
          onSelect={handleSelectContact}
          onLogout={handleLogout}
        />
        <ChatWindow
          username={username}
          selectedContact={selectedContact}
          messages={messages}
          onSendMessage={handleSendMessage}
          socket={socket}
        />
      </Box>
    </>
  );
};

export default ChatApp;