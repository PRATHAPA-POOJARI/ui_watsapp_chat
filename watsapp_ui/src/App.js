
import './App.css';
import { io } from "socket.io-client";
import { Box } from '@mui/material';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import { useState } from 'react';
import ChatWindow from './components/ChatWindow';
const socket = io("http://localhost:5000");


const App = () => {
  const [username, setUsername] = useState(null);
  const [selectedUser, setSelectedUser] = useState("");

  if (!username) return <Login setUsername={setUsername} />;

  return (
    <Box display="flex" height="100vh">
      <Sidebar
        username={username}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
      />

      <ChatWindow
        username={username}
        selectedUser={selectedUser}
        socket={socket}
      />
    </Box>
  );
};

export default App;