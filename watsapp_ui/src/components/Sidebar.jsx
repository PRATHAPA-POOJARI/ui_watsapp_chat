import React from "react";
import {
  AppBar,
  Avatar,
  Box,
  Toolbar,
  Typography,
  Divider,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";

const Sidebar = ({ username, selectedUser, setSelectedUser }) => {
  const dummyUsers = ["Rahul", "Sneha", "Amit", "Priya", "John"];

  return (
    <Box width="25%" borderRight="1px solid #ddd" display="flex" flexDirection="column">
      <AppBar position="static" color="success">
        <Toolbar>
          <Avatar sx={{ mr: 2 }}>{username?.charAt(0)?.toUpperCase()}</Avatar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {username}
          </Typography>
        </Toolbar>
      </AppBar>

      <Typography p={1} variant="subtitle2">
        Chats
      </Typography>

      <Divider />

      <List>
        {dummyUsers.map((user, i) => (
          <ListItemButton
            key={i}
            selected={selectedUser === user}
            onClick={() => setSelectedUser(user)}
          >
            <ListItemText primary={user} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
