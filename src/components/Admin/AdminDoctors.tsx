import {Box,Typography,Container,Avatar,Paper,LinearProgress,Chip} from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import { orchestrator } from "#/core/Orchestrator";
import { DATA_MACHINE_ID } from "#/machines/dataMachine";
import "./AdminDashboard.css";
import "./AdminDoctors.css";
import { useMachines } from "#/providers/MachineProvider";

export default function AdminDoctors() {

  const {  adminUserState, } = useMachines();
  const adminContext = adminUserState.context;


  const specialties = adminContext.adminStats.specialties || [];
  const loading = adminContext.loading;

  const getActualDoctors = () => {
    try {
      const dataSnapshot = orchestrator.getSnapshot(DATA_MACHINE_ID);
      return dataSnapshot.context.doctors || [];
    } catch (error) {
      console.warn("Could not get doctors data:", error);
      return [];
    }
  };


  const getRealSpecialtyData = () => {
    const doctors = getActualDoctors();
    const specialtyCounts: { [key: string]: number } = {};
    
    doctors.forEach((doctor: any) => {
      const specialty = doctor.specialty;
      if (specialty) {
        specialtyCounts[specialty] = (specialtyCounts[specialty] || 0) + 1;
      }
    });

    return specialties.map((specialty: string) => ({
      specialty,
      count: specialtyCounts[specialty] || 0,
      color: '#22577a'
    }));
  };


  const chartData = getRealSpecialtyData();
  
  const totalActiveDoctors = getActualDoctors().length;

  return (
    <Box className="dashboard-container">
      <Container maxWidth="lg">
        <Box className="dashboard-header-section">
          <Box className="dashboard-header-content">
            <Avatar className="dashboard-header-avatar admin-header-avatar">
              <LocalHospitalIcon className="dashboard-header-icon" />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" className="dashboard-header-title">
                Estadísticas de Doctores
              </Typography>
              <Typography variant="h6" className="dashboard-header-subtitle admin-header-subtitle">
                Análisis detallado del rendimiento y métricas de profesionales médicos
              </Typography>
            </Box>
          </Box>
        </Box>

   
        <Box className="admin-doctors-container">
          <Paper className="admin-doctors-paper">
            
           
            <Box className="stats-cards-container">
              <Box className="stats-card">
                <Typography variant="h6" className="stats-card-number">{adminContext.adminStats.doctors}</Typography>
                <Typography variant="caption" className="stats-card-label">Activos</Typography>
              </Box>
              <Box className="stats-card">
                <Typography variant="h6" className="stats-card-number">{adminContext.adminStats.specialties.length || 0}</Typography>
                <Typography variant="caption" className="stats-card-label">Especialidades</Typography>
              </Box>
            
            </Box>

            {!loading && specialties.length > 0 && (
              <Box className="specialties-section">
                <Box className="specialties-header">
                  <Typography variant="h6" className="specialties-title">
                    Distribución por Especialidades
                  </Typography>
                  {specialties.length > 6 && (
                    <Chip 
                      label={`${specialties.length} especialidades`}
                      size="small"
                      variant="outlined"
                      className="specialties-chip"
                    />
                  )}
                </Box>
            
                <Box className="chart-grid">
                  {chartData.map((item: any, index: number) => (
                    <Box 
                      key={index} 
                      className="chart-card"
                    >
                      <Box className="chart-card-header">
                        <Chip 
                          label={item.specialty}
                          className="specialty-chip"
                        />
                        <Box className="doctor-count-container">
                          <Typography variant="h6" className="doctor-count-number">
                            {item.count}
                          </Typography>
                          <Typography variant="caption" className="doctor-count-label">
                            doctores
                          </Typography>
                        </Box>
                      </Box>
                      
                      <LinearProgress
                        variant="determinate"
                        value={totalActiveDoctors > 0 ? (item.count / totalActiveDoctors) * 100 : 0}
                        className="specialty-progress"
                      />
                      
                      <Box className="chart-footer">
                        <Typography variant="body2" className="chart-footer-text">
                          {item.count === 0 ? "Sin doctores" : "Del total"}
                        </Typography>
                        <Box className="percentage-badge">
                          {totalActiveDoctors > 0 ? Math.round((item.count / totalActiveDoctors) * 100) : 0}%
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {loading && (
              <Box className="loading-state">
                <Typography variant="body2" className="loading-text">
                  Cargando datos de especialidades...
                </Typography>
              </Box>
            )}

            {!loading && specialties.length === 0 && (
              <Box className="empty-state">
                <Typography variant="body2" className="empty-text">
                  No hay especialidades disponibles
                </Typography>
              </Box>
            )}

            
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}