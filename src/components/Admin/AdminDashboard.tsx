import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Badge,
  Container,
  Avatar,
  Button
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ patients: 0, doctors: 0, pending: 0 });
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      // These would be actual API calls
      setStats({
        patients: 150,
        doctors: 25,
        pending: 5,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <Box className="admin-dashboard-container">
      <Container maxWidth="lg">
        <Box className="admin-header-section">
          <Box className="admin-header-content">
            <Avatar className="admin-header-avatar">
              <LocalHospitalIcon sx={{ fontSize: 32, color: 'white' }} />
            </Avatar>
            <Box>
              <Typography variant="h3" component="h1" className="admin-header-title">
                Panel de Administración
              </Typography>
              <Typography variant="h6" className="admin-header-subtitle">
                Gestiona pacientes, doctores y solicitudes pendientes
              </Typography>
            </Box>
          </Box>
        </Box>

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
                      {stats.pending > 0 && (
                        <Badge
                          badgeContent={stats.pending}
                          color="error"
                          className="admin-stats-badge"
                        />
                      )}
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

        {/* Action Cards */}
        <Box className="admin-actions-container">
          <Box className="admin-action-item">
            <Card className="admin-action-card" onClick={() => navigate('/admin/patients')}>
              <CardContent className="admin-action-content">
                <Avatar className="admin-action-avatar admin-action-avatar-patients">
                  <PersonIcon className="admin-action-icon" />
                </Avatar>
                <Typography variant="h5" component="h2" className="admin-action-title">
                  Gestionar Pacientes
                </Typography>
                <Typography variant="body1" className="admin-action-description">
                  Ver lista completa de pacientes registrados y su información
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
            <Card className="admin-action-card" onClick={() => navigate('/admin/doctors')}>
              <CardContent className="admin-action-content">
                <Avatar className="admin-action-avatar admin-action-avatar-doctors">
                  <LocalHospitalIcon className="admin-action-icon" />
                </Avatar>
                <Typography variant="h5" component="h2" className="admin-action-title">
                  Gestionar Doctores
                </Typography>
                <Typography variant="body1" className="admin-action-description">
                  Administrar doctores activos y sus especialidades
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
            <Card className="admin-action-card" onClick={() => navigate('/admin/pending-doctors')}>
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
                >
                  {stats.pending > 0 ? `Revisar (${stats.pending})` : 'Ver Solicitudes'}
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
