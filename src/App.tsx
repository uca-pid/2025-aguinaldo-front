import './App.css'
import { Routes, Route, useNavigate } from 'react-router-dom'
import HomeScreen from './components/HomeScreen/HomeScreen'
import { useAuthMachine } from './providers/AuthProvider'
import { Avatar, Box, Divider, ListItemIcon, Menu, MenuItem, Typography } from '@mui/material'
import { SignInResponse } from './models/Auth'
import { useMachines } from './providers/MachineProvider'
import { Logout, Person } from '@mui/icons-material'
import PendingScreen from './components/Admin/PendingScreen/PendingScreen'
import ProfileScreen from './components/ProfileScreen/ProfileScreen'
import { useEffect } from 'react'
import ReservationTurns from './components/Patient/ReservationTurns'
import ViewTurns from './components/Patient/ViewTurns'
import EnableHours from './components/Doctor/EnableHours'
import ViewPatients from './components/Doctor/ViewPatients'
import DoctorViewTurns from './components/Doctor/DoctorViewTurns'

function AppContent() {
  const navigate = useNavigate();
  const { auth } = useAuthMachine();
  const { authResponse, context: authContext } = auth;
  const {ui} = useMachines();
  const { context: uiContext, send: uiSend } = ui;
  const user = authResponse as SignInResponse;
  
  // Usar el perfil actualizado si está disponible, sino usar authResponse
  const userName = authContext.profile?.name || user.name;
  const userRole = authContext.profile?.role || user.role;

  const open = Boolean(uiContext.toggleStates?.["userMenu"]);

  useEffect(() => {
    if (uiContext.navigationRequested) {
      navigate(uiContext.navigationRequested);
      uiSend({ type: "NAVIGATE", to: null });
    }
  }, [uiContext.navigationRequested, navigate, uiSend]);

  const handleLogout = () => {
    auth.send({ type: 'LOGOUT' });
  };

  const handleNavigateToProfile = () => {
    uiSend({ type: "TOGGLE", key: "userMenu" });
    uiSend({ type: "NAVIGATE", to: "/profile" });
  };

  const renderAdminRoutes = () => (
    <>
      <Route path="/admin/pending" element={<PendingScreen />} />
      <Route path="/admin/patients" element={<div>Admin Patients Page - To be implemented</div>} />
      <Route path="/admin/doctors" element={<div>Admin Doctors Page - To be implemented</div>} />
    </>
  );

  const renderDoctorRoutes = () => (
    <>
      <Route path="/doctor/enable-hours" element={<EnableHours />} />
      <Route path="/doctor/view-patients" element={<ViewPatients />} />
      <Route path="/doctor/view-turns" element={<DoctorViewTurns />} />
    </>
  );

  const renderPatientRoutes = () => (
    <>
      <Route path="/patient/reservation-turns" element={<ReservationTurns />} />
      <Route path="/patient/view-turns" element={<ViewTurns />} />
    </>
  );

  return (
      <Box>
        <Box className="app-header">
          <Box>
            <h2>MediBook</h2>
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
          <MenuItem onClick={handleNavigateToProfile}>
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
          <Route path="*" element={<HomeScreen />} />
          
          {userRole === 'ADMIN' && renderAdminRoutes()}
          {userRole === 'DOCTOR' && renderDoctorRoutes()}
          {userRole === 'PATIENT' && renderPatientRoutes()}
          
          <Route path="/profile" element={<ProfileScreen />} />
        </Routes>
      </Box>
  );
}

function App() {
  return (
      <AppContent />
  );
}

export default App