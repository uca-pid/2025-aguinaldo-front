import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Container,
  Avatar,
  Button,
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
import LoadingThreeDotsJumping from "../shared/PageLoadingScreen/LoadingThreeDots";
import { useDataMachine } from "#/providers/DataProvider";

export default function AdminDashboard() {
  const { authState } = useAuthMachine();
  const user = authState.context.authResponse as SignInResponse | null;
  const { uiSend, adminUserState, adminUserSend } = useMachines();
  const { dataState } = useDataMachine();
  const adminContext = adminUserState.context;
  const dataContext = dataState.context;

  const stats = adminContext.adminStats;
  
  // Admin dashboard needs to wait for ALL admin-specific data to be loaded
  const loading = adminContext.loading || 
                  dataContext.loading?.doctors || 
                  dataContext.loading?.pendingDoctors || 
                  dataContext.loading?.adminStats ||
                  dataContext.loading?.specialties;
  const error = adminContext.error;

  const handleRetry = () => {
    if (user?.accessToken) {
      adminUserSend({ 
        type: 'FETCH_ADMIN_STATS', 
        accessToken: user.accessToken 
      });
    }
  };

  return (
    <Box className="dashboard-container">
      {/* Loading Overlay */}
      {loading && (
        <Box 
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(4px)'
          }}
        >
          <LoadingThreeDotsJumping />
        </Box>
      )}
      
      <Container maxWidth="lg">
        <Box className="dashboard-header-section">
          <Box className="dashboard-header-content">
            <Avatar className="dashboard-header-avatar admin-header-avatar">
              <LocalHospitalIcon className="dashboard-header-icon" />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" className="dashboard-header-title">
                Panel de Administración
              </Typography>
              <Typography variant="h6" className="dashboard-header-subtitle admin-header-subtitle">
                Gestiona solicitudes y estadísticas
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

        {/* Stats Section - Only show when not loading */}
        {!loading && stats && (
          <Box className="admin-stats-container">
            <Box className="admin-stats-item">
              <Card className="admin-stats-card">
                <CardContent className="admin-stats-content">
                  <Box className="admin-stats-layout">
                    <div className="admin-stats-icon-wrapper">
                      <PersonIcon className="admin-stats-icon" />
                    </div>
                    <Box className="admin-stats-text">
                      <Typography variant="h4" className="admin-stats-number">
                        {stats.patients}
                      </Typography>
                      <Typography variant="body1" className="admin-stats-label">
                        Pacientes Registrados
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
            
            <Box className="admin-stats-item">
              <Card className="admin-stats-card">
                <CardContent className="admin-stats-content">
                  <Box className="admin-stats-layout">
                    <div className="admin-stats-icon-wrapper">
                      <LocalHospitalIcon className="admin-stats-icon" />
                    </div>
                    <Box className="admin-stats-text">
                      <Typography variant="h4" className="admin-stats-number">
                        {stats.doctors}
                      </Typography>
                      <Typography variant="body1" className="admin-stats-label">
                        Doctores Activos
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
            
            <Box className="admin-stats-item">
              <Card className="admin-stats-card">
                <CardContent className="admin-stats-content">
                  <Box className="admin-stats-layout">
                    <div className="admin-stats-icon-wrapper">
                      <PendingActionsIcon className="admin-stats-icon" />
                    </div>
                    <Box className="admin-stats-text">
                      <Typography variant="h4" className="admin-stats-number">
                        {stats.pending}
                      </Typography>
                      <Typography variant="body1" className="admin-stats-label">
                        Solicitudes Pendientes
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}

        {/* Action Cards - Only show when not loading */}
        {!loading && (
          <Box className="dashboard-actions-container">
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
              badge={stats?.pending}
            />
          </Box>
        )}
      </Container>
    </Box>
  );
}
