import { useEffect } from "react";
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Badge,
  Container,
  Avatar,
  Button,
  CircularProgress,
  Alert
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import { useAuthMachine } from "#/providers/AuthProvider";
import { useMachines } from "#/providers/MachineProvider";
import { SignInResponse } from "#/models/Auth";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const { auth } = useAuthMachine();
  const { authResponse } = auth;
  const { adminUser, ui } = useMachines();
  const { context: adminContext, send: adminSend, state: adminState } = adminUser;
  const { send: uiSend } = ui;
  const user = authResponse as SignInResponse;

  const stats = adminContext.adminStats;
  const loading = adminContext.loading;
  const error = adminContext.error;

  useEffect(() => {
    if (user?.accessToken) {
      adminSend({ 
        type: 'FETCH_ADMIN_STATS', 
        accessToken: user.accessToken 
      });
    }
  }, [user?.accessToken, adminSend]);

  const handleRetry = () => {
    if (user?.accessToken) {
      adminSend({ 
        type: 'FETCH_PENDING_DOCTORS', 
        accessToken: user.accessToken 
      });
    }
  };

  return (
    <Box className="admin-dashboard-container">
      <Container maxWidth="lg">
        <Box className="admin-header-section">
          <Box className="admin-header-content">
            <Avatar className="admin-header-avatar">
              <LocalHospitalIcon className="admin-header-icon" />
            </Avatar>
            <Box>
              <Typography variant="h3" component="h1" className="admin-header-title">
                Panel de Administración
              </Typography>
              <Typography variant="h6" className="admin-header-subtitle">
                Gestiona solicitudes pendientes y analiza estadísticas
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Box sx={{ mb: 4 }}>
            <Alert 
              severity="error" 
              action={
                <Button color="inherit" size="small" onClick={handleRetry}>
                  Reintentar
                </Button>
              }
              onClose={() => adminSend({ type: 'CLEAR_ERROR' })}
            >
              {error}
            </Alert>
          </Box>
        )}

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Stats Section */}
        <Box className="admin-stats-container">
          <Box className="admin-stats-item">
            <Card className="admin-stats-card">
              <CardContent className="admin-stats-content">
                <Box className="admin-stats-layout">
                  <Box>
                    <Typography variant="h3" className="admin-stats-number">
                      {stats.patients}
                    </Typography>
                    <Typography variant="body1" className="admin-stats-label">
                      Pacientes Registrados
                    </Typography>
                  </Box>
                  <PersonIcon className="admin-stats-icon" />
                </Box>
              </CardContent>
            </Card>
          </Box>
          
          <Box className="admin-stats-item">
            <Card className="admin-stats-card">
              <CardContent className="admin-stats-content">
                <Box className="admin-stats-layout">
                  <Box>
                    <Typography variant="h3" className="admin-stats-number">
                      {stats.doctors}
                    </Typography>
                    <Typography variant="body1" className="admin-stats-label">
                      Doctores Activos
                    </Typography>
                  </Box>
                  <LocalHospitalIcon className="admin-stats-icon" />
                </Box>
              </CardContent>
            </Card>
          </Box>
          
          <Box className="admin-stats-item">
            <Card className="admin-stats-card">
              <CardContent className="admin-stats-content">
                <Box className="admin-stats-layout">
                  <Box>
                    <Typography variant="h3" className="admin-stats-number">
                      {stats.pending}
                    </Typography>
                    <Typography variant="body1" className="admin-stats-label">
                      Solicitudes Pendientes
                    </Typography>
                  </Box>
                  <PendingActionsIcon className="admin-stats-icon" />
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Action Cards */}``
        <Box className="admin-actions-container">
          <Box className="admin-action-item">
            <Card className="admin-action-card" onClick={() => uiSend({type:'NAVIGATE', to:'/admin/patients'})}>
              <CardContent className="admin-action-content">
                <Avatar className="admin-action-avatar admin-action-avatar-patients">
                  <PersonIcon className="admin-action-icon" />
                </Avatar>
                <Typography variant="h5" component="h2" className="admin-action-title">
                  Pacientes
                </Typography>
                <Typography variant="body1" className="admin-action-description">
                  Ver mas estadísticas de los pacientes
                </Typography>
                <Button 
                  variant="contained" 
                  className="admin-action-button admin-action-button-patients"
                >
                  Ver Pacientes
                </Button>
              </CardContent>
            </Card>
          </Box>

          <Box className="admin-action-item">
            <Card className="admin-action-card" onClick={() => uiSend({type:'NAVIGATE', to:'/admin/doctors'})}>
              <CardContent className="admin-action-content">
                <Avatar className="admin-action-avatar admin-action-avatar-doctors">
                  <LocalHospitalIcon className="admin-action-icon" />
                </Avatar>
                <Typography variant="h5" component="h2" className="admin-action-title">
                  Doctores
                </Typography>
                <Typography variant="body1" className="admin-action-description">
                  Ver mas estadísticas de los doctores
                </Typography>
                <Button 
                  variant="contained" 
                  className="admin-action-button admin-action-button-doctors"
                >
                  Ver Doctores
                </Button>
              </CardContent>
            </Card>
          </Box>

          <Box className="admin-action-item">
            <Card className="admin-action-card">
              <CardContent className="admin-action-content">
                <Avatar className="admin-action-avatar admin-action-avatar-pending">
                  <PendingActionsIcon className="admin-action-icon" />
                  {stats.pending > 0 && (
                    <Badge
                      badgeContent={stats.pending}
                      color="error"
                      className="admin-pending-badge"
                    />
                  )}
                </Avatar>
                <Typography variant="h5" component="h2" className="admin-action-title">
                  Solicitudes Pendientes
                </Typography>
                <Typography variant="body1" className="admin-action-description">
                  Revisar y aprobar solicitudes de registro de doctores
                </Typography>
                <Button 
                  variant="contained" 
                  className="admin-action-button admin-action-button-pending"
                    onClick={() => {
                      adminSend({ type: 'FETCH_PENDING_DOCTORS', accessToken: user?.accessToken });
                      uiSend({ type: 'NAVIGATE', to: '/admin/pending' });
                    }}
                  disabled={adminState.matches('fetchingPendingDoctors')}
                  startIcon={adminState.matches('fetchingPendingDoctors') ? <CircularProgress size={20} /> : null}
                >
                  Ver Solicitudes
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
