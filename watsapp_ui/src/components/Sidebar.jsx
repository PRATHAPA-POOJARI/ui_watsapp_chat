import React, { use } from 'react'
import { AppBar, Avatar, Box,Toolbar,Typography,Divider, List } from '@mui/material'
const Sidebar = ({username}) => {
    const[msg,  setMsg]=React.useState("")
    const[ messages,setMessages]=React.useState([])
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
        Chats
      </Typography>
          <Divider />
          <List>

            
          </List>
    </>
  )
}

export default Sidebar
