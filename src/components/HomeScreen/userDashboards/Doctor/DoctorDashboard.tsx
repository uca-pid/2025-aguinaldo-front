import React, { useEffect } from "react";
import {
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CircularProgress,
  Container,
  Avatar,
  Button,
  Chip
} from "@mui/material";
import ScheduleIcon from "@mui/icons-material/Schedule";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import PersonIcon from "@mui/icons-material/Person";
import { useMachines } from "#/providers/MachineProvider";
import { useAuthMachine } from "#/providers/AuthProvider";
import { SignInResponse } from "#/models/Auth";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ViewTurns from "./ViewTurns";
import EnableHours from "./EnableHours";
import ViewPatients from "./ViewPatients";
import dayjs from "dayjs";
import "./DoctorDashboard.css";

const DoctorDashboard: React.FC = () => {
  const { ui, turn } = useMachines();
  const { auth } = useAuthMachine();
  const { send: uiSend } = ui;
  const authContext = auth.context;
  const user = auth.authResponse as SignInResponse;
  const { state: turnState, send: turnSend } = turn;
  const turnContext = turnState.context;

  useEffect(() => {
    if (authContext.isAuthenticated && user.accessToken && user.id) {
      turnSend({
        type: "SET_AUTH",
        accessToken: user.accessToken,
        userId: user.id
      });
      
      turnSend({ type: "LOAD_MY_TURNS" });
    }
  }, [authContext.isAuthenticated, user.accessToken, user.id, turnSend]);

  const upcomingTurns = turnContext.myTurns
    .filter((turn: any) => {
      const turnDate = dayjs(turn.scheduledAt);
      const now = dayjs();
      const isUpcoming = turnDate.isAfter(now);
      
      return isUpcoming && (turn.status === 'SCHEDULED' || turn.status === 'CANCELED');
    })
    .slice(0, 10)
    .sort((a: any, b: any) => dayjs(a.scheduledAt).diff(dayjs(b.scheduledAt)));

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box className="doctor-dashboard-container">
        <Container maxWidth="lg">
          <Box className="doctor-header-section">
            <Box className="doctor-header-content">
              <Avatar className="doctor-header-avatar">
                <PersonIcon className="doctor-header-icon" />
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" className="doctor-header-title">
                  Hola, Dr. {user.name || 'Doctor'}
                </Typography>
                <Typography variant="h6" className="doctor-header-subtitle">
                  Gestiona tus turnos y pacientes
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box className="doctor-actions-container">
            <Box className="doctor-action-item">
              <Card className="doctor-action-card" onClick={() => uiSend({ type: "TOGGLE", key: "showDoctorReservations" })}>
                <CardContent className="doctor-action-content">
                  <Avatar className="doctor-action-avatar doctor-action-avatar-schedule">
                    <ScheduleIcon className="doctor-action-icon" />
                  </Avatar>
                  <Typography variant="h5" component="h2" className="doctor-action-title">
                    Ver Turnos
                  </Typography>
                  <Typography variant="body1" className="doctor-action-description">
                    Consulta y gestiona todos tus turnos programados
                  </Typography>
                  <Button 
                    variant="contained" 
                    className="doctor-action-button doctor-action-button-schedule"
                  >
                    Mis Turnos
                  </Button>
                </CardContent>
              </Card>
            </Box>

            <Box className="doctor-action-item">
              <Card className="doctor-action-card" onClick={() => uiSend({ type: "TOGGLE", key: "showPatients" })}>
                <CardContent className="doctor-action-content">
                  <Avatar className="doctor-action-avatar doctor-action-avatar-patients">
                    <PeopleAltIcon className="doctor-action-icon" />
                  </Avatar>
                  <Typography variant="h5" component="h2" className="doctor-action-title">
                    Pacientes
                  </Typography>
                  <Typography variant="body1" className="doctor-action-description">
                    Ver y administrar tu lista de pacientes
                  </Typography>
                  <Button 
                    variant="contained" 
                    className="doctor-action-button doctor-action-button-patients"
                  >
                    Ver Pacientes
                  </Button>
                </CardContent>
              </Card>
            </Box>

            <Box className="doctor-action-item">
              <Card className="doctor-upcoming-card">
                <Typography variant="h6" className="doctor-upcoming-header">
                  Próximos Turnos
                </Typography>
                
                <Box className="doctor-upcoming-content">
                  {turnContext.isLoadingMyTurns ? (
                    <Box className="doctor-upcoming-loading">
                      <CircularProgress size={24} />
                      <Typography className="doctor-upcoming-loading-text">
                        Cargando turnos...
                      </Typography>
                    </Box>
                  ) : turnContext.myTurnsError ? (
                    <Typography variant="body2" className="doctor-upcoming-error">
                      Error al cargar turnos: {turnContext.myTurnsError}
                    </Typography>
                  ) : upcomingTurns.length > 0 ? (
                    upcomingTurns.map((turn: any, index: number) => (
                      <Box key={turn.id || index} className={`doctor-upcoming-item ${turn.status === 'CANCELED' ? 'doctor-upcoming-item-canceled' : ''}`}>
                        <Box className="doctor-upcoming-header-row">
                          <Typography variant="body1" className="doctor-upcoming-date">
                            {dayjs(turn.scheduledAt).format("DD/MM/YYYY - HH:mm")}
                          </Typography>
                          {turn.status === 'CANCELED' && (
                            <Chip 
                              label="CANCELADO" 
                              size="small" 
                              className="doctor-upcoming-canceled-chip"
                              sx={{
                                backgroundColor: '#fee2e2',
                                color: '#dc2626',
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }}
                            />
                          )}
                        </Box>
                        <Typography variant="body2" className="doctor-upcoming-patient">
                          Paciente: {turn.patientName || "Paciente"}
                        </Typography>
                        {turn.reason && (
                          <Typography variant="body2" className="doctor-upcoming-reason">
                            Motivo: {turn.reason}
                          </Typography>
                        )}
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" className="doctor-upcoming-empty">
                      No tenés turnos próximos
                    </Typography>
                  )}
                </Box>
              </Card>
            </Box>

            <Box className="doctor-action-item">
              <Card className="doctor-action-card" onClick={() => uiSend({ type: "TOGGLE", key: "enableDoctorReservations" })}>
                <CardContent className="doctor-action-content">
                  <Avatar className="doctor-action-avatar doctor-action-avatar-availability">
                    <EventAvailableIcon className="doctor-action-icon" />
                  </Avatar>
                  <Typography variant="h5" component="h2" className="doctor-action-title">
                    Disponibilidad
                  </Typography>
                  <Typography variant="body1" className="doctor-action-description">
                    Define los horarios disponibles para reservas
                  </Typography>
                  <Button 
                    variant="contained" 
                    className="doctor-action-button doctor-action-button-availability"
                  >
                    Configurar
                  </Button>
                </CardContent>
              </Card>
            </Box>
          </Box>

          <ViewTurns />
          <EnableHours />
          <ViewPatients />
        </Container>
      </Box>
    </LocalizationProvider>
  );
};

export default DoctorDashboard;
