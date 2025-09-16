import React, { useEffect } from "react";
import {
  Box, 
  Typography, 
  Container,
  Avatar
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
import DashboardCard from "../shared/DashboardCard/DashboardCard";
import DashboardUpcomingCard from "../shared/DashboardUpcomingCard/DashboardUpcomingCard";
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
            <DashboardCard
              type="doctor"
              variant="primary"
              icon={<ScheduleIcon className="doctor-action-icon" />}
              title="Ver Turnos"
              description="Consulta y gestiona todos tus turnos programados"
              buttonText="Mis Turnos"
              onClick={() => uiSend({ type: "TOGGLE", key: "showDoctorReservations" })}
            />

            <DashboardCard
              type="doctor"
              variant="secondary"
              icon={<PeopleAltIcon className="doctor-action-icon" />}
              title="Pacientes"
              description="Ver y administrar tu lista de pacientes"
              buttonText="Ver Pacientes"
              onClick={() => uiSend({ type: "TOGGLE", key: "showPatients" })}
            />

            <DashboardUpcomingCard
              type="doctor"
              title="Próximos Turnos"
              turns={upcomingTurns}
              isLoading={turnContext.isLoadingMyTurns}
              error={turnContext.myTurnsError}
              emptyMessage="No tenés turnos próximos"
            />

            <DashboardCard
              type="doctor"
              variant="accent"
              icon={<EventAvailableIcon className="doctor-action-icon" />}
              title="Disponibilidad"
              description="Define los horarios disponibles para reservas"
              buttonText="Configurar"
              onClick={() => uiSend({ type: "TOGGLE", key: "enableDoctorReservations" })}
            />
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
