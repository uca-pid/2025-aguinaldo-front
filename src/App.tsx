import './App.css'
import { Routes, Route, useNavigate } from 'react-router-dom'
import HomeScreen from './components/HomeScreen/HomeScreen'
import { useAuthMachine } from './providers/AuthProvider'
import { Avatar, Box, Divider, ListItemIcon, Menu, MenuItem, Typography } from '@mui/material'
import { useMachines } from './providers/MachineProvider'
import { Logout, Person } from '@mui/icons-material'
import PendingScreen from './components/Admin/PendingScreen/PendingScreen'
import ProfileScreen from './components/ProfileScreen/ProfileScreen'
import { useEffect } from 'react'
import ReservationTurns from './components/Patient/ReservationTurns'
import ViewTurns from './components/Patient/ViewTurns'
import ModifyTurn from './components/Patient/ModifyTurn'
import EnableHours from './components/Doctor/EnableHours/EnableHours'
import ViewPatients from './components/Doctor/ViewPatients/ViewPatients'
import DoctorViewTurns from './components/Doctor/DoctorViewTurns/DoctorViewTurns'
import PatientDetails from './components/Doctor/PatientDetails/PatientDetails'
import SnackbarAlert from './components/shared/SnackbarAlert/SnackbarAlert'

function AppContent() {
  const navigate = useNavigate();
  const { authState, authSend } = useAuthMachine();
  const authContext = authState.context;

  const { uiState, uiSend } = useMachines();
  const uiContext = uiState.context;

  const userName = authContext.authResponse?.name || '';
  const userRole = authContext.authResponse?.role || '';

  const open = Boolean(uiContext.toggleStates?.["userMenu"]);

  useEffect(() => {
    uiSend({ type: "ADD_NAVIGATE_HOOK", navigate, initialPath: window.location.pathname });
  }, [uiSend, navigate]);

  const handleLogout = () => {
    authSend({ type: 'LOGOUT' });
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
      <Route path="/patient-detail" element={<PatientDetails />} />
    </>
  );

  const renderPatientRoutes = () => (
    <>
      <Route path="/patient/reservation-turns" element={<ReservationTurns />} />
      <Route path="/patient/view-turns" element={<ViewTurns />} />
      <Route path="/patient/modify-turn" element={<ModifyTurn />} />
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
        <SnackbarAlert />
      </Box>
  );
}

function App() {
  return (
      <AppContent />
  );
}

export default App