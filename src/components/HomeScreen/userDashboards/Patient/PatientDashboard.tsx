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
  Alert
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PersonIcon from "@mui/icons-material/Person";
import { useMachines } from "#/providers/MachineProvider";
import { useAuthMachine } from "#/providers/AuthProvider";
import { SignInResponse } from "#/models/Auth";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ReservationTurns from "./ReservationTurns";
import ViewTurns from "./ViewTurns";
import dayjs from "dayjs";
import "./PatientDashboard.css";

const PatientDashboard: React.FC = () => {
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
      
      return isUpcoming && turn.status === 'SCHEDULED';
    })
    .slice(0, 10)
    .sort((a: any, b: any) => dayjs(a.scheduledAt).diff(dayjs(b.scheduledAt)));

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box className="patient-dashboard-container">
        <Container maxWidth="lg">
          <Box className="patient-header-section">
            <Box className="patient-header-content">
              <Avatar className="patient-header-avatar">
                <PersonIcon className="patient-header-icon" />
              </Avatar>
              <Box>
                <Typography variant="h3" component="h1" className="patient-header-title">
                  Mi Panel de Paciente
                </Typography>
                <Typography variant="h6" className="patient-header-subtitle">
                  Gestiona tus turnos médicos y citas
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Action Cards */}
          <Box className="patient-actions-container">
            <Box className="patient-action-item">
              <Card className="patient-action-card" onClick={() => uiSend({ type: "TOGGLE", key: "showDoAReservationTurn" })}>
                <CardContent className="patient-action-content">
                  <Avatar className="patient-action-avatar patient-action-avatar-reservation">
                    <CalendarTodayIcon className="patient-action-icon" />
                  </Avatar>
                  <Typography variant="h5" component="h2" className="patient-action-title">
                    Reservar Turno
                  </Typography>
                  <Typography variant="body1" className="patient-action-description">
                    Agenda una nueva cita médica con tu especialista preferido
                  </Typography>
                  <Button 
                    variant="contained" 
                    className="patient-action-button patient-action-button-reservation"
                  >
                    Nuevo Turno
                  </Button>
                </CardContent>
              </Card>
            </Box>

            <Box className="patient-action-item">
              <Card className="patient-action-card" onClick={() => uiSend({ type: "TOGGLE", key: "reservations" })}>
                <CardContent className="patient-action-content">
                  <Avatar className="patient-action-avatar patient-action-avatar-view">
                    <ListAltIcon className="patient-action-icon" />
                  </Avatar>
                  <Typography variant="h5" component="h2" className="patient-action-title">
                    Mis Turnos
                  </Typography>
                  <Typography variant="body1" className="patient-action-description">
                    Consulta, modifica o cancela tus turnos programados
                  </Typography>
                  <Button 
                    variant="contained" 
                    className="patient-action-button patient-action-button-view"
                  >
                    Ver Turnos
                  </Button>
                </CardContent>
              </Card>
            </Box>

            <Box className="patient-action-item">
              <Card className="patient-upcoming-card">
                <Typography variant="h6" className="patient-upcoming-header">
                  Próximos Turnos
                </Typography>
                
                <Box className="patient-upcoming-content">
                  {turnContext.isLoadingMyTurns ? (
                    <Box className="patient-upcoming-loading">
                      <CircularProgress size={24} />
                    </Box>
                  ) : turnContext.myTurnsError ? (
                    <Typography variant="body2" className="patient-upcoming-error">
                      Error al cargar turnos: {turnContext.myTurnsError}
                    </Typography>
                  ) : upcomingTurns.length > 0 ? (
                    upcomingTurns.map((turn: any, index: number) => (
                      <Box key={turn.id || index} className="patient-upcoming-item">
                        <Typography variant="body1" className="patient-upcoming-date">
                          {dayjs(turn.scheduledAt).format("DD/MM/YYYY - HH:mm")}
                        </Typography>
                        <Typography variant="body2" className="patient-upcoming-doctor">
                          {turn.doctorName || "Doctor"} - {turn.doctorSpecialty || "Especialidad"}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" className="patient-upcoming-empty">
                      No tenés turnos próximos
                    </Typography>
                  )}
                </Box>
              </Card>
            </Box>
          </Box>

          <ReservationTurns />
          <ViewTurns />
        </Container>
      </Box>
    </LocalizationProvider>
  );
};

export default PatientDashboard;
