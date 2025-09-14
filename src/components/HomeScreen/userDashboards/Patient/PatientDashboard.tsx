import React from "react";
import {
  Box, Typography, Grid, Card, CardActionArea, CardContent, List, ListItem, ListItemText, Paper,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ListAltIcon from "@mui/icons-material/ListAlt";
import { styled } from "@mui/material/styles";
import { useMachines } from "../../../../providers/MachineProvider";
import {LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ReservationTurns from "./ReservationTurns";
import ViewTurns from "./ViewTurns";

const HoverCard = styled(Card)(({ theme }) => ({
  transition: "transform 0.2s, box-shadow 0.2s",
  height: "100%",
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: theme.shadows[6],
  },
}));

const upcomingAppointments = [
  { date: "15/09/2025", time: "08:30", doctor: "Dra. Martínez", profession: "Médico" },
  { date: "15/09/2025", time: "09:15", doctor: "Dr. García", profession: "Nutricionista" },
  { date: "15/09/2025", time: "11:45", doctor: "Dra. Pérez", profession: "Psicólogo" },
  { date: "16/09/2025", time: "10:00", doctor: "Dr. Rodríguez", profession: "Médico" },
  { date: "16/09/2025", time: "13:30", doctor: "Dra. Gómez", profession: "Nutricionista" },
  { date: "17/09/2025", time: "09:00", doctor: "Dr. Ruiz", profession: "Psicólogo" },
  { date: "17/09/2025", time: "14:00", doctor: "Dr. López", profession: "Médico" },
  { date: "18/09/2025", time: "15:15", doctor: "Dra. Fernández", profession: "Psicólogo" },
  { date: "18/09/2025", time: "17:00", doctor: "Dr. Gómez", profession: "Nutricionista" },
  { date: "20/09/2025", time: "11:00", doctor: "Dra. Sánchez", profession: "Médico" },
];
const PatientDashboard: React.FC = () => {
  const { ui } = useMachines();
  const { send: uiSend } = ui;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        bgcolor="#ffffff"
        width="100%"
        display="flex"
        flexDirection="column"
        gap={3}
        borderRadius={3}
        alignItems="center"
      >
        <Grid container spacing={3} justifyContent="center" alignItems="stretch">
          <Grid display="flex" justifyContent="center">
            <HoverCard sx={{ width: "100%", maxWidth: 300 }}>
              <CardActionArea onClick={() => uiSend({ type: "TOGGLE", key: "showDoAReservationTurn" })} sx={{ height: "100%" }}>
                <CardContent sx={{ textAlign: "center", py: 6 }}>
                  <CalendarTodayIcon fontSize="large" color="primary" />
                  <Typography variant="h6" mt={2}>Reservar Turno</Typography>
                </CardContent>
              </CardActionArea>
            </HoverCard>
          </Grid>

          <Grid display="flex" justifyContent="center" >
            <HoverCard sx={{ width: "100%", maxWidth: 300 }}>
              <CardActionArea onClick={() => uiSend({type:"TOGGLE", key:"reservations"})} sx={{ height: "100%" }}>
                <CardContent sx={{ textAlign: "center", py: 6 }}>
                  <ListAltIcon fontSize="large" color="secondary" />
                  <Typography variant="h6" mt={2} px={2.5}>Mis Turnos</Typography>
                </CardContent>
              </CardActionArea>
            </HoverCard>
          </Grid>

          <Grid display="flex" justifyContent="center">
            <Paper elevation={3} sx={{ height: "100%", width: "100%", maxWidth: 300 }}>
              <Typography variant="h6" p={2} borderBottom="1px solid #eee" px={2.5}>
                Próximos Turnos
              </Typography>
              <List sx={{ maxHeight: 200, overflowY: "auto" }}>
                {upcomingAppointments.map((appt, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={`${appt.date} - ${appt.time}`}
                      secondary={`Con ${appt.doctor}`}
                    />
                  </ListItem>
                ))}
                {upcomingAppointments.length === 0 && (
                  <Typography variant="body2">No tenés turnos próximos</Typography>
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>

        <ReservationTurns/>

        <ViewTurns/>
      </Box>
    </LocalizationProvider>
  );
};

export default PatientDashboard;
