import React from 'react'
import { Box,Paper, Typography } from '@mui/material'  
const Login = () => {
  return (
    <Box sx={{height:"100vh",
        display:'flex',
        justifyContent:'center',
        bgcolor:"#E0F2F1"
    }}>
<Paper sx={{ p:4,width:350,textAlign:'center' }} elevation={3}>

<Typography variant='h6' gutterBottom>

Welcome to WhatsApp
</Typography>

</Paper>

    </Box>
  )
}

export default Login
