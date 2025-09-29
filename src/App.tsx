import './App.css'
import { Routes, Route, useNavigate } from 'react-router-dom'
import HomeScreen from './components/HomeScreen/HomeScreen'
import { useAuthMachine } from './providers/AuthProvider'
import { Box, Typography } from '@mui/material'
import { useMachines } from './providers/MachineProvider'
import PendingScreen from './components/Admin/PendingScreen/PendingScreen'
import AdminPatients from './components/Admin/AdminPatients'
import AdminDoctors from './components/Admin/AdminDoctors'
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
import PendingActivation from './components/Doctor/PendingActivation/PendingActivation'
import TurnsModifications from './components/Doctor/TurnsModifications/TurnsModifications'
import FloatingMenu from './components/shared/FloatingMenu/FloatingMenu'

function AppContent() {
  const navigate = useNavigate();
  const { authState } = useAuthMachine();
  const authContext = authState.context;

  const { uiSend } = useMachines();


  const userRole = authContext.authResponse?.role || '';
  const userStatus = authContext.authResponse?.status || '';
  
  const shouldHideHeader = userStatus !== "ACTIVE";

  useEffect(() => {
    uiSend({ type: "ADD_NAVIGATE_HOOK", navigate, initialPath: window.location.pathname });
  }, [uiSend, navigate]);


  const renderAdminRoutes = () => (
    <>
      <Route path="/admin/pending" element={<PendingScreen />} />
      <Route path="/admin/patients" element={<AdminPatients />} />
      <Route path="/admin/doctors" element={<AdminDoctors />} />
    </>
  );

  const renderDoctorRoutes = () => (
    <>
      <Route path="/doctor/enable-hours" element={<EnableHours />} />
      <Route path="/doctor/view-patients" element={<ViewPatients />} />
      <Route path="/doctor/view-turns" element={<DoctorViewTurns />} />
      <Route path="/patient-detail" element={<PatientDetails />} />
      <Route path="/doctor/turns-modifications" element={<TurnsModifications />} />
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
      
        <FloatingMenu userRole={userRole as 'DOCTOR' | 'PATIENT' | 'ADMIN'} />
        
        {!shouldHideHeader && (
          <>
            <Box className="app-header">
              <Box>
                <h2>MediBook</h2>
              </Box>
             
            </Box>
          </>
        )}

        <Routes>
          <Route path="*" element={<HomeScreen />} />
          
          {userRole === 'ADMIN' && renderAdminRoutes()}
          {userRole === 'DOCTOR' && renderDoctorRoutes()}
          {userRole === 'PATIENT' && renderPatientRoutes()}
          
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/pending-activation" element={<PendingActivation />} />
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