import React, { useState, useEffect, useRef } from "react";
import { Box } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../Redux/slices/authSlice";
import { logout as otpLogout } from "../Redux/slices/otpSlice";
import { initSocket, disconnectSocket } from "../socket/Socket";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import {
  API_SEARCH_USERS,
  API_CREATE_CHAT,
  API_GET_MESSAGES,
  API_SEND_MESSAGE,
} from "../config";

const ChatApp = ({ username }) => {
  const dispatch = useDispatch();
  const { token, user } = useSelector((s) => s.auth);

  const [socket, setSocket]                   = useState(null);
  const [contacts, setContacts]               = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [activeChatId, setActiveChatId]       = useState(null);
  const [messages, setMessages]               = useState([]);

  // Keep activeChatId accessible inside socket callbacks
  const activeChatIdRef = useRef(null);
  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  // 1. Init socket
  useEffect(() => {
    if (!token) return;
    const s = initSocket(token);
    setSocket(s);
    return () => disconnectSocket();
  }, [token]);

  // 2. Load all users
  useEffect(() => {
    const authToken = localStorage.getItem("token");
    if (!authToken) return;

    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_SEARCH_USERS}?query=`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const data = await res.json();
        if (Array.isArray(data)) {
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

  // 3. Restore active chat after page refresh
  useEffect(() => {
    const savedChatId = localStorage.getItem("activeChatId");
    const savedContact = localStorage.getItem("activeContact");
    if (!savedChatId || !savedContact) return;

    const authToken = localStorage.getItem("token");
    setActiveChatId(savedChatId);
    activeChatIdRef.current = savedChatId;
    setSelectedContact(JSON.parse(savedContact));

    fetch(API_GET_MESSAGES(savedChatId), {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then((r) => r.json())
      .then((history) => {
        if (Array.isArray(history)) setMessages(history);
      });
  }, []);

  // 4. Rejoin chat room after socket + activeChatId are both ready
  useEffect(() => {
    if (!socket || !activeChatId) return;
    socket.emit("join_chat", activeChatId);
    console.log("🔁 Rejoined chat room:", activeChatId);
  }, [socket, activeChatId]);

  // 5. Track online/offline
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

  // 6. Receive messages — single handler using ref
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (msg) => {
      console.log("📩 Received message:", msg);

      // Update sidebar preview
      setContacts((prev) =>
        prev.map((c) =>
          c.id === (msg.sender?._id || msg.senderId)
            ? {
                ...c,
                preview: msg.content,
                time: "now",
                unread:
                  activeChatIdRef.current === msg.chatId
                    ? 0
                    : (c.unread || 0) + 1,
              }
            : c
        )
      );

      // Add to messages if chat is open
      if (activeChatIdRef.current === msg.chatId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("receive_message", handleMessage);
    return () => socket.off("receive_message", handleMessage);
  }, [socket]); // ← only depends on socket, uses ref for activeChatId

  // 7. Select contact
  const handleSelectContact = async (contactId) => {
    const contact = contacts.find((c) => c.id === contactId);
    if (!contact) return;
    setSelectedContact(contact);
    setMessages([]);

    try {
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
      activeChatIdRef.current = chatId;
      localStorage.setItem("activeChatId", chatId);
      localStorage.setItem("activeContact", JSON.stringify(contact));

      socket?.emit("join_chat", chatId);

      const msgRes = await fetch(API_GET_MESSAGES(chatId), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const history = await msgRes.json();
      if (Array.isArray(history)) setMessages(history);
    } catch (err) {
      console.error("Failed to open chat:", err);
    }
  };

  // 8. Send message
  const handleSendMessage = async (content) => {
    if (!content.trim() || !activeChatId) return;

    const tempMsg = {
      _id: `temp_${Date.now()}`,
      chatId: activeChatId,
      content,
      sender: { _id: user?.id, username: user?.username },
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await fetch(API_SEND_MESSAGE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ chatId: activeChatId, content }),
      });
      const saved = await res.json();

      setMessages((prev) =>
        prev.map((m) => (m._id === tempMsg._id ? saved : m))
      );

      socket?.emit("send_message", { ...saved, chatId: activeChatId });

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

  // 9. Logout
  const handleLogout = () => {
    localStorage.removeItem("activeChatId");
    localStorage.removeItem("activeContact");
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
      <Box sx={{ display: "flex", height: "100vh", overflow: "hidden", width: "100%" }}> 
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


