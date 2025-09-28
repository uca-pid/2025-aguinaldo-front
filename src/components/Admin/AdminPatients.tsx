import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  Avatar,
  Paper,
  LinearProgress
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { useMachines } from "#/providers/MachineProvider";
import "./AdminDashboard.css";

export default function AdminPatients() {
  const { adminUserState } = useMachines();
  const adminContext = adminUserState.context;

  const stats = adminContext.adminStats;

  // Mock data for development - replace with real API calls
  const patientStats = {
    totalPatients: stats.patients || 0,
    activePatients: Math.floor((stats.patients || 0) * 0.85), // 85% active
    newPatientsThisMonth: Math.floor((stats.patients || 0) * 0.12), // 12% new this month
    averageTurnsPerPatient: 3.2,
    patientRetentionRate: 92,
    topSpecialties: [
      { name: "Cardiología", count: 45 },
      { name: "Dermatología", count: 38 },
      { name: "Pediatría", count: 52 },
      { name: "Ginecología", count: 41 }
    ]
  };

  return (
    <Box className="admin-dashboard-container">
      <Container maxWidth="lg">
        <Box className="admin-header-section">
          <Box className="admin-header-content">
            <Avatar className="admin-header-avatar">
              <PersonIcon className="admin-header-icon" />
            </Avatar>
            <Box>
              <Typography variant="h3" component="h1" className="admin-header-title">
                Estadísticas de Pacientes
              </Typography>
              <Typography variant="h6" className="admin-header-subtitle">
                Análisis detallado del comportamiento y métricas de pacientes
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Key Metrics */}
        <Box className="admin-stats-container">
          <Box className="admin-stats-item">
            <Card className="admin-stats-card">
              <CardContent className="admin-stats-content">
                <Box className="admin-stats-layout">
                  <Box>
                    <Typography variant="h3" className="admin-stats-number">
                      {patientStats.totalPatients}
                    </Typography>
                    <Typography variant="body1" className="admin-stats-label">
                      Total Pacientes
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
                      {patientStats.activePatients}
                    </Typography>
                    <Typography variant="body1" className="admin-stats-label">
                      Pacientes Activos
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
                      {patientStats.newPatientsThisMonth}
                    </Typography>
                    <Typography variant="body1" className="admin-stats-label">
                      Nuevos Este Mes
                    </Typography>
                  </Box>
                  <TrendingUpIcon className="admin-stats-icon" />
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
                      {patientStats.averageTurnsPerPatient}
                    </Typography>
                    <Typography variant="body1" className="admin-stats-label">
                      Turnos Promedio
                    </Typography>
                  </Box>
                  <CalendarTodayIcon className="admin-stats-icon" />
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Detailed Stats */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '1 1 45%', minWidth: '300px' }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Tasa de Retención de Pacientes
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={patientStats.patientRetentionRate}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                  <Typography variant="body2" color="text.secondary">
                    {`${patientStats.patientRetentionRate}%`}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Pacientes que continúan usando el servicio
              </Typography>
            </Paper>
          </Box>

          <Box sx={{ flex: '1 1 45%', minWidth: '300px' }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Especialidades Más Solicitadas
              </Typography>
              {patientStats.topSpecialties.map((specialty, index) => (
                <Box key={specialty.name} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    {index + 1}. {specialty.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {specialty.count} pacientes
                  </Typography>
                </Box>
              ))}
            </Paper>
          </Box>
        </Box>

        {/* Placeholder for future charts */}
        <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="h6" color="text.secondary" align="center">
            📊 Gráficos y análisis avanzados próximamente
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
            Esta sección incluirá gráficos interactivos de tendencias, distribución por edad,
            frecuencia de visitas y otros indicadores clave.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}