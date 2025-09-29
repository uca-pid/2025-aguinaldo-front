import { PendingDoctor } from "#/models/Admin";
import { SignInResponse } from "#/models/Auth";
import { useAuthMachine } from "#/providers/AuthProvider";
import { useMachines } from "#/providers/MachineProvider";
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CircularProgress, 
  Typography,
  Paper,
  Avatar,
  Chip
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import "../AdminDashboard.css";
import "./PendingScreen.css";


export default function PendingScreen() {
  const { authState } = useAuthMachine();
  const user = authState.context.authResponse as SignInResponse | null;
  const { adminUserState, adminUserSend, uiSend } = useMachines();
  const adminContext = adminUserState.context;

  const pendingDoctors = adminContext.pendingDoctors || [];

    return (
    <Box className="pending-main-container">
      {/* Header Section */}
      <Box className="viewpatients-header">
        <Box className="viewpatients-header-layout">
          <Box className="viewpatients-back-button-container">
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => uiSend({ type: 'NAVIGATE', to: '/' })}
              className="viewpatients-back-button"
            >
              Volver
            </Button>
          </Box>
          <Box className="viewpatients-header-content">
            <Avatar className="viewpatients-header-icon">
              <PendingActionsIcon sx={{ fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" className="viewpatients-header-title">
                Solicitudes Pendientes
              </Typography>
              <Typography variant="h6" className="viewpatients-header-subtitle">
                Gestionar solicitudes de registro de médicos
              </Typography>
            </Box>
          </Box>
          <Box className="viewpatients-header-spacer"></Box>
        </Box>
      </Box>

      <Box maxWidth="lg" className="pending-content-container" sx={{ mx: 'auto', px: 3 }}>
        {/* Pending Doctors List */}
        {pendingDoctors.length > 0 ? (
          <Box>
            <Box className="pending-status-chip-container">
              <Chip 
                label={`${pendingDoctors.length} solicitud(es) pendiente(s)`}
                className="pending-status-chip"
              />
            </Box>
            
            <Box className="pending-cards-container">
              {pendingDoctors.map((doctor: PendingDoctor) => (
                <Card key={doctor.id} elevation={2} className="pending-doctor-card">
                  <CardContent className="pending-doctor-card-content">
                    <Box className="pending-doctor-card-layout">
                      <Box className="pending-doctor-info-section">
                        <Avatar className="pending-doctor-avatar">
                          <PersonIcon sx={{ fontSize: 28 }} />
                        </Avatar>
                        <Box className="pending-doctor-details">
                          <Typography variant="h6" className="pending-doctor-name">
                            Dr. {doctor.name} {doctor.surname}
                          </Typography>
                          <Typography variant="body2" className="pending-doctor-info">
                            <strong>Email:</strong> {doctor.email}
                          </Typography>
                          <Typography variant="body2" className="pending-doctor-info">
                            <strong>Especialidad:</strong> {doctor.specialty}
                          </Typography>
                          <Typography variant="body2" className="pending-doctor-info">
                            <strong>Matricula:</strong> {doctor.medicalLicense}
                          </Typography>
                        </Box>
                      </Box>
                      <Box className="pending-actions-section">
                        <Button
                          variant="contained"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => adminUserSend({ 
                            type: 'APPROVE_DOCTOR', 
                            doctorId: doctor.id,
                            accessToken: user?.accessToken
                          })}
                          disabled={adminUserState.matches('approvingDoctor')}
                          className="pending-approve-button"
                        >
                          {adminUserState.matches('approvingDoctor') ? 
                            <CircularProgress size={16} sx={{ color: 'white', mr: 1 }} /> : null}
                          {adminUserState.matches('approvingDoctor') ? 'Aprobando...' : 'Aprobar'}
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<CancelIcon />}
                          onClick={() => adminUserSend({ 
                            type: 'REJECT_DOCTOR', 
                            doctorId: doctor.id,
                            accessToken: user?.accessToken
                          })}
                          disabled={adminUserState.matches('rejectingDoctor')}
                          className="pending-reject-button"
                        >
                          {adminUserState.matches('rejectingDoctor') ? 
                            <CircularProgress size={16} sx={{ color: 'white', mr: 1 }} /> : null}
                          {adminUserState.matches('rejectingDoctor') ? 'Rechazando...' : 'Rechazar'}
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        ) : (
          <Paper elevation={2} className="pending-empty-state">
            <Box className="pending-empty-emoji">📋</Box>
            <Typography variant="h5" className="pending-empty-title">
              No hay solicitudes pendientes
            </Typography>
            <Typography variant="body1" className="pending-empty-subtitle">
              Todas las solicitudes de médicos han sido procesadas
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
    );
}