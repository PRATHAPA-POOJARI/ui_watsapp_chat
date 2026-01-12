import React, { use } from 'react'
import { AppBar, Avatar, Box,Toolbar,Typography,Divider, List, ListItemButton, ListItemText } from '@mui/material'
const Sidebar = ({username,selectedUser}) => {
    const[msg,  setMsg]=React.useState("")
    const[ messages,setMessages]=React.useState([])

    const dummyUsers = ["Rahul", "Sneha", "Amit", "Priya", "John"];
  return (
    <>
    <Box  width="25" borderRadius={"1px solid #ddd"} display='flex' flexDirection='column'></Box>

    <AppBar position="static" color="success">
<Toolbar>
  <Avatar sx={{ mr: 2 }}>{username.charAt(0).toUpperCase()}</Avatar>
  <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
    {username}
  </Typography>

</Toolbar>
      </AppBar>

   <Typography p={1} variant="subtitle2">
        Chats zsfsfasf xfsxfsd
      </Typography>
          <Divider />
       <List>
        {dummyUsers.map((user, i) => (
          <ListItemButton key={i} onClick={() => setSelectedUser(user)}>
            <ListItemText primary={user} />
          </ListItemButton>
        ))}
      </List>
    </>
  )
}

export default Sidebar
