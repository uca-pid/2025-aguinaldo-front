import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomeScreen from './components/HomeScreen/HomeScreen'
import { useAuthMachine } from './providers/AuthProvider'
import { Avatar, Box, Button, Divider, ListItemIcon, Menu, MenuItem, Typography } from '@mui/material'
import { SignInResponse } from './models/Auth'
import { useMachines } from './providers/MachineProvider'
import { Logout, Person } from '@mui/icons-material'

function App() {
  const { auth } = useAuthMachine();
  const { authResponse } = auth;
  const {ui} = useMachines();
  const { context: uiContext, send: uiSend } = ui;
  const user = authResponse as SignInResponse;
  const userName = user.name;

  const open = Boolean(uiContext.toggleStates?.["userMenu"]);

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
            <h2>MediBook - Welcome {user.name} {user.surname}!</h2>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
          <Avatar
            sx={{ cursor: "pointer" }}
            onClick={() =>
              uiSend({
                type: "TOGGLE",
                key: "userMenu",
              })
            }
          >
            {userName.charAt(0)}
          </Avatar>
          <Typography
            variant="subtitle1"
            fontWeight={500}
            sx={{ cursor: "pointer" }}
            onClick={() =>
              uiSend({
                type: "TOGGLE",
                key: "userMenu",
              })
            }
          >
            {userName}
          </Typography>
        </Box>

        <Menu
          open={open}
          onClose={() => uiSend({ type: "TOGGLE", key: "userMenu" })}
          anchorOrigin={{ horizontal: "right", vertical: "top" }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          PaperProps={{
            elevation: 4,
            sx: {
              mt: 1.5,
              borderRadius: 3,
              minWidth: 200,
              position: "absolute",
              top: 60,
              right: 20,
            },
          }}
        >
          <MenuItem
            onClick={() => {
              uiSend({ type: "TOGGLE", key: "userMenu" });
              alert("Ir al perfil");
            }}
          >
            <ListItemIcon>
              <Person fontSize="small" />
            </ListItemIcon>
            Mi perfil
          </MenuItem>

          <Divider />

          <MenuItem
            onClick={() => {
              uiSend({ type: "TOGGLE", key: "userMenu" });
              handleLogout();
            }}
            sx={{ color: "error.main" }}
          >
            <ListItemIcon>
              <Logout fontSize="small" color="error" />
            </ListItemIcon>
            Cerrar sesión
          </MenuItem>
        </Menu>
        </Box>

        <Routes>
          <Route path="/" element={<HomeScreen />} />
        </Routes>
      </Box>
    </BrowserRouter>
  )
}

export default App