import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomeScreen from './components/HomeScreen/HomeScreen'
import { useAuthMachine } from './providers/AuthProvider'
import { Box, Button } from '@mui/material'

function App() {
  const { auth } = useAuthMachine();

  const handleLogout = () => {
    auth.send({ type: 'LOGOUT' });
  };

  return (
    <BrowserRouter>
      <Box>
        <Box 
          sx={{ 
            p: 2, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            background: '#22577a',
            color: 'white',
            boxShadow: '0 2px 8px rgba(34, 87, 122, 0.2)'
          }}
        >
          <Box>
            <h2>MediBook - Welcome {auth.context.user?.name}!</h2>
          </Box>
          <Button 
            onClick={handleLogout}
            variant="contained"
            sx={{
              background: 'white',
              color: '#22577a',
              fontWeight: 'bold',
              boxShadow: '0 2px 8px rgba(255, 255, 255, 0.2)',
              '&:hover': {
                background: '#f8f9fa',
                boxShadow: '0 4px 12px rgba(255, 255, 255, 0.3)',
              }
            }}
          >
            Logout
          </Button>
        </Box>

        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/dashboard" element={<HomeScreen />} />
        </Routes>
      </Box>
    </BrowserRouter>
  )
}

export default App