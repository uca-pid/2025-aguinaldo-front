import {useState, useEffect} from "react";
import {
  Box, 
  Typography, 
  Container,
  Avatar,
  Badge
} from "@mui/material";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import PersonIcon from "@mui/icons-material/Person";
import NotificationsIcon from "@mui/icons-material/Notifications";
import type { TurnModifyRequest } from "#/models/TurnModifyRequest";
import { TurnService } from "#/service/turn-service.service";
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

  const [pendingModifyRequests, setPendingModifyRequests] = useState<TurnModifyRequest[]>([]);
  const availability = doctorContext?.availability || [];
  const hasConfiguredDays = availability.some((day: any) => day.enabled && day.ranges?.length > 0);

    useEffect(() => {
      const fetchPendingRequests = async () => {
        if (!user.accessToken) return;
        try {
          const requests = await TurnService.getDoctorModifyRequests(user.id, user.accessToken);
          setPendingModifyRequests(requests.filter(r => r.status === "PENDING"));
        } catch {
          setPendingModifyRequests([]);
        }
      };
      fetchPendingRequests();
    }, [user.accessToken]);

  const upcomingTurns = turnContext?.myTurns || []
    .filter((turn: any) => {
      const turnDate = dayjs(turn.scheduledAt);
      const now = dayjs();
      const isUpcoming = turnDate.isAfter(now);
      
      return isUpcoming && (turn.status === 'SCHEDULED' || turn.status === 'CANCELED');
    })
    .slice(0, 3)
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
              variant="secondary"
              icon={<PeopleAltIcon className="doctor-action-icon" />}
              title="Pacientes"
              description="Ver y administrar tu lista de pacientes"
              buttonText="Ver Pacientes"
              onClick={() => uiSend({ type: "NAVIGATE", to: "/doctor/view-patients" })}
            />

            {pendingModifyRequests.length > 0 ? (
              <Badge 
                badgeContent={pendingModifyRequests.length} 
                color="error" 
                sx={{
                  '& .MuiBadge-badge': {
                    animation: 'pulse 1.5s infinite',
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(1)', opacity: 1 },
                      '50%': { transform: 'scale(1.2)', opacity: 0.8 },
                      '100%': { transform: 'scale(1)', opacity: 1 },
                    },
                  },
                }}
              >
                <DashboardCard
                  type="doctor"
                  variant="primary"
                  icon={<NotificationsIcon className="doctor-action-icon" />}
                  title="Solicitudes Pendientes"
                  description="Gestiona solicitudes de modificación de turnos"
                  buttonText="Ver Solicitudes"
                  onClick={() => uiSend({ type: "NAVIGATE", to: "/doctor/turns-modifications" })}
                />
              </Badge>
            ) : (
              <DashboardCard
                type="doctor"
                variant="primary"
                icon={<NotificationsIcon className="doctor-action-icon" />}
                title="Solicitudes Pendientes"
                description="Gestiona solicitudes de modificación de turnos"
                buttonText="Ver Solicitudes"
                onClick={() => uiSend({ type: "NAVIGATE", to: "/doctor/turns-modifications" })}
              />
            )}

            <DashboardUpcomingCard
              type="doctor"
              title="Próximos Turnos"
              turns={upcomingTurns}
              isLoading={turnContext?.isLoadingMyTurns}
              error={turnContext?.myTurnsError}
              emptyMessage="No tenés turnos próximos"
              viewAllText="Ver todos"
              onViewAll={() => uiSend({ type: "NAVIGATE", to: "/doctor/view-turns" })}
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
