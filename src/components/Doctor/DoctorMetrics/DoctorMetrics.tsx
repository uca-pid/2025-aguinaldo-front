import React from 'react';
import {
  Box, 
  Typography, 
  Container,
  Avatar,
  Card,
  CardContent
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ScheduleIcon from "@mui/icons-material/Schedule";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BarChartIcon from "@mui/icons-material/BarChart";
import LoadingThreeDotsJumping from "../../shared/PageLoadingScreen/LoadingThreeDots";
import { useMachines } from "#/providers/MachineProvider";
import { useAuthMachine } from "#/providers/AuthProvider";
import { SignInResponse } from "#/models/Auth";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "./DoctorMetrics.css";
import { useDataMachine } from "#/providers/DataProvider";
import { turnsOfTheMonth, upComingTurns } from "#/utils/filterTurns";


const DoctorMetrics: React.FC = () => {
  const { dataState } = useDataMachine();
  const dataContext = dataState.context;
  const {turnState } = useMachines();

  const turnContext = turnState?.context;
  const authContext = useAuthMachine().authState?.context;
  const user = authContext.authResponse as SignInResponse;

  
  const isLoading = dataContext.loading?.myTurns || 
                   turnContext?.isLoadingMyTurns;
  
  const pastTurnsThisMonth = turnsOfTheMonth(turnContext?.myTurns || []);
  const totalUpcomingTurns = upComingTurns(turnContext?.myTurns || []);
  const averageTurnDuration = 45; 
  

  const allTurns = turnContext?.myTurns || [];
  const cancelledTurns = allTurns.filter((turn: any) => turn.status === 'CANCELED');
  const totalPatients = dataContext.doctorPatients?.length || 0;
    
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box className="dashboard-container">

        {isLoading && (
          <Box className="loading-overlay">
            <LoadingThreeDotsJumping />
          </Box>
        )}
        
        <Container maxWidth="lg">
          <Box className="back-button-container">
          </Box>
          
          <Box className="dashboard-header-section">
            <Box className="dashboard-header-content">
              <Avatar className="dashboard-header-avatar doctor-header-avatar">
                <BarChartIcon className="dashboard-header-icon" />
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" className="dashboard-header-title">
                  Métricas del Dr. {user.name || 'Doctor'}
                </Typography>
                <Typography variant="h6" className="dashboard-header-subtitle doctor-header-subtitle">
                  Estadísticas detalladas de tu actividad médica
                </Typography>
              </Box>
            </Box>
          </Box>

          {!isLoading && (
            <>
             
              <Box className="admin-stats-container">
                <Box className="admin-stats-item">
                  <Card className="admin-stats-card">
                    <CardContent className="admin-stats-content">
                      <Box className="admin-stats-layout">
                        <div className="admin-stats-icon-wrapper">
                          <CheckCircleIcon className="admin-stats-icon" />
                        </div>
                        <Box className="admin-stats-text">
                          <Typography variant="h4" className="admin-stats-number">
                            {pastTurnsThisMonth}
                          </Typography>
                          <Typography variant="body1" className="admin-stats-label">
                            Turnos Completados Este Mes
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
                          <ScheduleIcon className="admin-stats-icon" />
                        </div>
                        <Box className="admin-stats-text">
                          <Typography variant="h4" className="admin-stats-number">
                            {totalUpcomingTurns}
                          </Typography>
                          <Typography variant="body1" className="admin-stats-label">
                            Turnos Próximos
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
                          <AccessTimeIcon className="admin-stats-icon" />
                        </div>
                        <Box className="admin-stats-text">
                          <Typography variant="h4" className="admin-stats-number">
                            {averageTurnDuration}
                          </Typography>
                          <Typography variant="body1" className="admin-stats-label">
                            Minutos Promedio por Consulta
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              </Box>

       
              <Box className="admin-stats-container additional-metrics-container">
                <Box className="admin-stats-item">
                  <Card className="admin-stats-card">
                    <CardContent className="admin-stats-content">
                      <Box className="admin-stats-layout">
                        <div className="admin-stats-icon-wrapper">
                          <PersonIcon className="admin-stats-icon" />
                        </div>
                        <Box className="admin-stats-text">
                          <Typography variant="h4" className="admin-stats-number">
                            {totalPatients}
                          </Typography>
                          <Typography variant="body1" className="admin-stats-label">
                            Total de Pacientes
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
                          <ScheduleIcon className="admin-stats-icon" />
                        </div>
                        <Box className="admin-stats-text">
                          <Typography variant="h4" className="admin-stats-number">
                            {cancelledTurns.length}
                          </Typography>
                          <Typography variant="body1" className="admin-stats-label">
                            Turnos Cancelados
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              </Box>

              <Box className="summary-section">
                <Card className="admin-stats-card">
                  <CardContent>
                    <Typography variant="h6" className="summary-title">
                      Resumen de Actividad
                    </Typography>
                    <Typography variant="body1" className="summary-item">
                      • Tienes {totalUpcomingTurns} turnos programados próximamente
                    </Typography>
                    <Typography variant="body1" className="summary-item">
                      • Atiendes a {totalPatients} pacientes únicos
                    </Typography>
                    <Typography variant="body1" className="summary-item">
                      • Tu duración promedio de consulta es de {averageTurnDuration} minutos
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </>
          )}
        </Container>
      </Box>
    </LocalizationProvider>
  );
};

export default DoctorMetrics;