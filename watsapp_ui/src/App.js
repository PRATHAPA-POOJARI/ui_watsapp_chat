import './App.css';
import { io } from "socket.io-client";
import { Box } from '@mui/material';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { loginSuccess } from './Redux/slices/authSlice';

const socket = io("http://localhost:5000");

const App = () => {
  const dispatch = useDispatch();   // ✅ FIXED
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      dispatch(loginSuccess(JSON.parse(storedUser)));
    }
  }, [dispatch]);

  if (!user) return <Login />;

  return (
    <Box display="flex" height="100vh">
      <Sidebar
        username={user.username}
        selectedUser={user.selectedUser || ""}
        setSelectedUser={() => {}}
      />
      <ChatWindow
        username={user.username}
        selectedUser={user.selectedUser || ""}
        socket={socket}
      />
    </Box>
  );
};

export default App;
