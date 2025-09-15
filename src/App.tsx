import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomeScreen from './components/HomeScreen/HomeScreen'
import { useAuthMachine } from './providers/AuthProvider'
import { Avatar, Box, Divider, ListItemIcon, Menu, MenuItem, Typography } from '@mui/material'
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
        <Box className="app-header">
          <Box>
            <h2>MediBook - Welcome {user.name} {user.surname}!</h2>
          </Box>
          <Box className="app-user-section">
          <Avatar
            className="app-avatar"
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
            className="app-username"
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
            className: "app-menu"
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
            className="app-menu-item-error"
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