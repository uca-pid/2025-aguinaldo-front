import React from "react";
import {
  Box, 
  Typography, 
  Container,
  Avatar
} from "@mui/material";
import ScheduleIcon from "@mui/icons-material/Schedule";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import PersonIcon from "@mui/icons-material/Person";
import { useMachines } from "#/providers/MachineProvider";
import { useAuthMachine } from "#/providers/AuthProvider";
import { SignInResponse } from "#/models/Auth";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import DashboardCard from "../../shared/DashboardCard/DashboardCard";
import DashboardUpcomingCard from "../../shared/DashboardUpcomingCard/DashboardUpcomingCard";
import dayjs from "dayjs";
import "./DoctorDashboard.css";

const DoctorDashboard: React.FC = () => {
  const { uiSend, turnState, doctorState } = useMachines();
  const turnContext = turnState?.context;
  const doctorContext = doctorState?.context;
  const authContext = useAuthMachine().authState?.context;
  const user = authContext.authResponse as SignInResponse;

  const availability = doctorContext?.availability || [];
  const hasConfiguredDays = availability.some((day: any) => day.enabled && day.ranges?.length > 0);

  const upcomingTurns = turnContext?.myTurns || []
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
      <Box className="dashboard-container">
        <Container maxWidth="lg">
          <Box className="dashboard-header-section">
            <Box className="dashboard-header-content">
              <Avatar className="dashboard-header-avatar doctor-header-avatar">
                <PersonIcon className="dashboard-header-icon" />
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" className="dashboard-header-title">
                  Hola, Dr. {user.name || 'Doctor'}
                </Typography>
                <Typography variant="h6" className="dashboard-header-subtitle doctor-header-subtitle">
                  Gestiona tus turnos y pacientes
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box className="dashboard-actions-container">
            <DashboardCard
              type="doctor"
              variant="primary"
              icon={<ScheduleIcon className="doctor-action-icon" />}
              title="Ver Turnos"
              description="Consulta y gestiona todos tus turnos programados"
              buttonText="Mis Turnos"
              onClick={() => uiSend({ type: "NAVIGATE", to: "/doctor/view-turns" })}
            />

            <DashboardCard
              type="doctor"
              variant="secondary"
              icon={<PeopleAltIcon className="doctor-action-icon" />}
              title="Pacientes"
              description="Ver y administrar tu lista de pacientes"
              buttonText="Ver Pacientes"
              onClick={() => uiSend({ type: "NAVIGATE", to: "/doctor/view-patients" })}
            />

            <DashboardUpcomingCard
              type="doctor"
              title="Próximos Turnos"
              turns={upcomingTurns}
              isLoading={turnContext?.isLoadingMyTurns}
              error={turnContext?.myTurnsError}
              emptyMessage="No tenés turnos próximos"
            />

            <DashboardCard
              type="doctor"
              variant={hasConfiguredDays ? "accent" : "warning"}
              icon={hasConfiguredDays ? <EventAvailableIcon className="doctor-action-icon" /> : <ErrorOutlineIcon className="doctor-action-icon" />}
              title="Disponibilidad"
              description={hasConfiguredDays ? "Define los horarios disponibles para reservas" : "⚠️ No tienes horarios configurados"}
              buttonText={hasConfiguredDays ? "Configurar" : "Configurar Ahora"}
              onClick={() => uiSend({ type: "NAVIGATE", to: "/doctor/enable-hours" })}
              warning={!hasConfiguredDays}
            />
          </Box>
        </Container>
      </Box>
    </LocalizationProvider>
  );
};

export default DoctorDashboard;
