import React from "react";
import { Box, Grid, Card, CardActionArea, CardContent, Typography, List, ListItem, ListItemText} from "@mui/material";
import ScheduleIcon from "@mui/icons-material/Schedule";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { styled } from "@mui/material/styles";
import { useMachines } from "../../../../providers/MachineProvider";
import ViewTurns from "../Doctor/Turns/ViewTurns";
import ViewPatients from "./ViewPatients";
import WeeklyAvailability from "./Turns/WeeklyAvailability";
const upcomingAppointments = [
  {
    id: 1,
    date: "15/09/2025",
    time: "10:30",
    patient: "María López",
    reason: "Control de presión arterial"
  },
  {
    id: 2,
    date: "15/09/2025",
    time: "11:30",
    patient: "Juan Pérez",
    reason: "Seguimiento psicológico"
  },
  {
    id: 3,
    date: "16/09/2025",
    time: "09:00",
    patient:"María García",
    reason: "" 
  },
  {
    id: 4,
    date: "16/09/2025",
    time: "10:15",
    patient: "Carlos Martínez",
    reason: "Consulta por dolor de espalda"
  },
  {
    id: 5,
    date: "17/09/2025",
    time: "14:00",
    patient: "Lucía Ramírez",
    reason: "" 
  }
];

const HoverCard = styled(Card)(({ theme }) => ({
  transition: "transform 0.2s, box-shadow 0.2s",
  height: "100%",
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: theme.shadows[6],
  },
}));

const DoctorDashboard: React.FC = () => {

  const { ui } = useMachines();
  const { context: uiContext, send: uiSend } = ui;
  const formContext = uiContext.toggleStates || {};
  const reservations= formContext["enableDoctorReservations"] ?? false;
  return (
    <Box width="100%" display="flex" flexDirection="column" gap={3} alignItems="center">
      <Grid container spacing={3} justifyContent="center" alignItems="stretch">
        <Grid>
          <HoverCard>
            <CardActionArea onClick={()=> uiSend({type:"TOGGLE", key:"showDoctorReservations"})} sx={{ height: "100%" }}>
              <CardContent sx={{ textAlign: "center", py: 6 }}>
                <ScheduleIcon fontSize="large" color="primary" />
                <Typography variant="h6" mt={2}>
                  Ver turnos
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Todos tus turnos programados
                </Typography>
              </CardContent>
            </CardActionArea>
          </HoverCard>
        </Grid>

        <Grid>
          <HoverCard>
            <CardActionArea onClick={()=>uiSend({ type: "TOGGLE", key: "enableDoctorReservations" })} sx={{ height: "100%" }}>
              <CardContent sx={{ textAlign: "center", py: 6 }}>
                <EventAvailableIcon fontSize="large" color="secondary" />
                <Typography variant="h6" mt={2}>
                  Disponibilidad
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Definí los horarios que pueden reservar los pacientes
                </Typography>
              </CardContent>
            </CardActionArea>
          </HoverCard>
        </Grid>

        <Grid>
          <HoverCard>
            <CardActionArea onClick={()=>uiSend({ type: "TOGGLE", key: "showPatients" })} sx={{ height: "100%" }}>
              <CardContent sx={{ textAlign: "center", py: 6 }}>
                <PeopleAltIcon fontSize="large" color="success" />
                <Typography variant="h6" mt={2}>
                  Pacientes
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Ver y administrar tu lista de pacientes
                </Typography>
              </CardContent>
            </CardActionArea>
          </HoverCard>
        </Grid>

        <Grid>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" borderBottom="1px solid #eee">
                Próximos Turnos
              </Typography>
              <List>
                {upcomingAppointments.map((appt) => (
                  <ListItem key={appt.id} divider>
                    <ListItemText
                      primary={`${appt.date} - ${appt.time}`}
                      secondary={
                        <>
                          Paciente: {appt.patient} <br />
                         
                          {appt.reason && (
                            <>
                              <br />
                              Motivo: {appt.reason}
                            </>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                ))}
                {upcomingAppointments.length === 0 && (
                  <Typography variant="body2">No tenés turnos próximos</Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <ViewTurns/>

      {reservations && <WeeklyAvailability/>}

      <ViewPatients/>

    </Box>
  );
};

export default DoctorDashboard;
