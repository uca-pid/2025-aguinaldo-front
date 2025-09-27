import React from "react";
import {
  Box, 
  Typography, 
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
import DashboardUpcomingCard from "../shared/DashboardUpcomingCard/DashboardUpcomingCard";
import dayjs from "dayjs";
import "./PatientDashboard.css";

const PatientDashboard: React.FC = () => {
  const { uiSend, turnState } = useMachines();
  const { authState } = useAuthMachine();
  const user: SignInResponse = authState?.context?.authResponse || {};
  const turnContext = turnState?.context || {};

  const upcomingTurns = (turnContext.myTurns || [])
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
      <Box className="dashboard-container">
        <Container maxWidth="lg">
          <Box className="dashboard-header-section">
            <Box className="dashboard-header-content">
              <Avatar className="dashboard-header-avatar patient-header-avatar">
                <PersonIcon className="dashboard-header-icon" />
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" className="dashboard-header-title">
                  Hola, {user.name || 'Paciente'}!
                </Typography>
                <Typography variant="h6" className="dashboard-header-subtitle patient-header-subtitle">
                  Gestiona tus turnos médicos y citas
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box className="dashboard-actions-container">
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

            <DashboardUpcomingCard
              type="patient"
              title="Próximos"
              turns={upcomingTurns}
              isLoading={turnContext.isLoadingMyTurns}
              error={turnContext.myTurnsError}
              emptyMessage="No tenés turnos próximos"
            />
          </Box>
        </Container>
      </Box>
    </LocalizationProvider>
  );
};

export default PatientDashboard;
