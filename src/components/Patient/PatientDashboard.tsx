import React, { useEffect } from "react";
import {
  Box, 
  Typography, 
  Card, 
  CircularProgress,
  Container,
  Avatar
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PersonIcon from "@mui/icons-material/Person";
import { useMachines } from "#/providers/MachineProvider";
import { useAuthMachine } from "#/providers/AuthProvider";
import { SignInResponse } from "#/models/Auth";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import DashboardCard from "../shared/DashboardCard/DashboardCard";
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
                <Typography variant="h4" component="h1" className="patient-header-title">
                  Hola, {user.name || 'Paciente'}!
                </Typography>
                <Typography variant="h6" className="patient-header-subtitle">
                  Gestiona tus turnos médicos y citas
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box className="patient-actions-container">
            <DashboardCard
              type="patient"
              variant="primary"
              icon={<CalendarTodayIcon className="patient-action-icon" />}
              title="Reservar Turno"
              description="Agenda una nueva cita médica con tu especialista preferido"
              buttonText="Nuevo Turno"
              onClick={() => uiSend({ type: "NAVIGATE", to: "/patient/reservation-turns" })}
            />

            <DashboardCard
              type="patient"
              variant="secondary"
              icon={<ListAltIcon className="patient-action-icon" />}
              title="Mis Turnos"
              description="Consulta, modifica o cancela tus turnos programados"
              buttonText="Ver Turnos"
              onClick={() => uiSend({ type: "NAVIGATE", to: "/patient/view-turns" })}
            />

            <Box className="patient-action-item">
              <Card className="patient-upcoming-card">
                <Typography variant="h6" className="patient-upcoming-header">
                  Próximos
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
        </Container>
      </Box>
    </LocalizationProvider>
  );
};

export default PatientDashboard;
