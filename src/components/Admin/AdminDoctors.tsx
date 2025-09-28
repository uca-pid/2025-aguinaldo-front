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
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import StarIcon from "@mui/icons-material/Star";
import { useMachines } from "#/providers/MachineProvider";
import "./AdminDashboard.css";

export default function AdminDoctors() {
  const { adminUserState } = useMachines();
  const adminContext = adminUserState.context;

  const stats = adminContext.adminStats;

  // Mock data for development - replace with real API calls
  const doctorStats = {
    totalDoctors: stats.doctors || 0,
    activeDoctors: Math.floor((stats.doctors || 0) * 0.92), // 92% active
    newDoctorsThisMonth: Math.floor((stats.doctors || 0) * 0.08), // 8% new this month
    averageRating: 4.7,
    doctorUtilizationRate: 78,
    topSpecialties: [
      { name: "Cardiología", count: 12 },
      { name: "Dermatología", count: 10 },
      { name: "Pediatría", count: 15 },
      { name: "Ginecología", count: 11 }
    ],
    performanceMetrics: {
      averageTurnsPerDay: 8.5,
      patientSatisfaction: 94,
      onTimeRate: 89
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
                Estadísticas de Doctores
              </Typography>
              <Typography variant="h6" className="admin-header-subtitle">
                Análisis detallado del rendimiento y métricas de profesionales médicos
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
                      {doctorStats.totalDoctors}
                    </Typography>
                    <Typography variant="body1" className="admin-stats-label">
                      Total Doctores
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
                      {doctorStats.activeDoctors}
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
                      {doctorStats.newDoctorsThisMonth}
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
                      {doctorStats.averageRating}
                    </Typography>
                    <Typography variant="body1" className="admin-stats-label">
                      Calificación Promedio
                    </Typography>
                  </Box>
                  <StarIcon className="admin-stats-icon" />
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
                Tasa de Utilización de Doctores
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={doctorStats.doctorUtilizationRate}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                  <Typography variant="body2" color="text.secondary">
                    {`${doctorStats.doctorUtilizationRate}%`}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Porcentaje de capacidad utilizada por los doctores
              </Typography>
            </Paper>
          </Box>

          <Box sx={{ flex: '1 1 45%', minWidth: '300px' }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Especialidades Disponibles
              </Typography>
              {doctorStats.topSpecialties.map((specialty, index) => (
                <Box key={specialty.name} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    {index + 1}. {specialty.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {specialty.count} doctores
                  </Typography>
                </Box>
              ))}
            </Paper>
          </Box>
        </Box>

        {/* Performance Metrics */}
        <Box sx={{ mt: 3 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Métricas de Rendimiento
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 2 }}>
              <Box sx={{ flex: '1 1 30%', minWidth: '200px' }}>
                <Typography variant="h4" color="primary">
                  {doctorStats.performanceMetrics.averageTurnsPerDay}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Turnos promedio por día
                </Typography>
              </Box>
              <Box sx={{ flex: '1 1 30%', minWidth: '200px' }}>
                <Typography variant="h4" color="primary">
                  {doctorStats.performanceMetrics.patientSatisfaction}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Satisfacción de pacientes
                </Typography>
              </Box>
              <Box sx={{ flex: '1 1 30%', minWidth: '200px' }}>
                <Typography variant="h4" color="primary">
                  {doctorStats.performanceMetrics.onTimeRate}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tasa de puntualidad
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Placeholder for future charts */}
        <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="h6" color="text.secondary" align="center">
            📊 Gráficos y análisis avanzados próximamente
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
            Esta sección incluirá gráficos de tendencias de rendimiento, distribución de especialidades,
            análisis de horarios y otros indicadores clave.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}