import './App.css';
import { Box } from '@mui/material';
import Login from './components/Login';
import ChatApp from './components/Chatapp';  // ✅ Changed from 'ChatApp' to 'Chatapp'
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { loginUser } from './Redux/slices/authSlice';

const App = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      dispatch(loginUser(JSON.parse(storedUser)));
    }
  }, [dispatch]);

  if (!isAuthenticated || !user) return <Login />;

  return (
    <Box display="flex" height="100vh">
      <ChatApp username={user.username} />
    </Box>
  );
};

export default App;