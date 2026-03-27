import { io } from "socket.io-client";

let socket = null;

export const getSocket = () => socket;

export const initSocket = (token) => {
  if (socket) return socket; // already connected

  socket = io("http://localhost:5000", {
    auth: { token },
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Socket error:", err.message);
  });

  socket.on("disconnect", () => {
    console.log("🔌 Socket disconnected");
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};