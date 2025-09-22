import { useEffect } from "react";
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
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
import DashboardCard from "../shared/DashboardCard/DashboardCard";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const { authState } = useAuthMachine();
  const user = authState.context.user as SignInResponse | null;
  const { uiSend, adminUserState, adminUserSend } = useMachines();
  const adminContext = adminUserState.context;

  const stats = adminContext.adminStats;
  const loading = adminContext.loading;
  const error = adminContext.error;

  useEffect(() => {
    if (user?.accessToken) {
      adminUserSend({ 
        type: 'FETCH_ADMIN_STATS', 
        accessToken: user.accessToken 
      });
    }
  }, [user?.accessToken, adminUserSend]);

  const handleRetry = () => {
    if (user?.accessToken) {
      adminUserSend({ 
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
              onClose={() => adminUserSend({ type: 'CLEAR_ERROR' })}
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
          <DashboardCard
            type="admin"
            variant="primary"
            icon={<PersonIcon className="admin-action-icon" />}
            title="Pacientes"
            description="Ver mas estadísticas de los pacientes"
            buttonText="Ver Pacientes"
            onClick={() => uiSend({type:'NAVIGATE', to:'/admin/patients'})}
          />

          <DashboardCard
            type="admin"
            variant="secondary"
            icon={<LocalHospitalIcon className="admin-action-icon" />}
            title="Doctores"
            description="Ver mas estadísticas de los doctores"
            buttonText="Ver Doctores"
            onClick={() => uiSend({type:'NAVIGATE', to:'/admin/doctors'})}
          />

          <DashboardCard
            type="admin"
            variant="accent"
            icon={<PendingActionsIcon className="admin-action-icon" />}
            title="Solicitudes Pendientes"
            description="Revisar y aprobar solicitudes de registro de doctores"
            buttonText="Ver Solicitudes"
            onClick={() => {
              adminUserSend({ type: 'FETCH_PENDING_DOCTORS', accessToken: user?.accessToken });
              uiSend({ type: 'NAVIGATE', to: '/admin/pending' });
            }}
            disabled={adminUserState.matches('fetchingPendingDoctors')}
            loading={adminUserState.matches('fetchingPendingDoctors')}
            badge={stats.pending}
          />
        </Box>
      </Container>
    </Box>
  );
}
