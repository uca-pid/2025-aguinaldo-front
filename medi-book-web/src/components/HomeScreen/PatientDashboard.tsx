import React from "react";
import { Box, Typography, Grid, Card, CardActionArea, CardContent, List, ListItem, ListItemText, Paper } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ListAltIcon from "@mui/icons-material/ListAlt";
import { styled } from "@mui/material/styles";

// Simulación de datos
const upcomingAppointments = [
  { date: "15/09/2025", time: "10:30", doctor: "Dr. Pérez" },
  { date: "20/09/2025", time: "14:00", doctor: "Dra. Gómez" },
  { date: "25/09/2025", time: "09:00", doctor: "Dr. Ruiz" }
];

// Card estilizada para hover
const HoverCard = styled(Card)(({ theme }) => ({
  transition: "transform 0.2s, box-shadow 0.2s",
  height: "100%",
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: theme.shadows[6],
  },
}));

const PatientDashboard: React.FC = () => {
  const handleReserveClick = () => alert("Ir a Reservar Turno");
  const handleMyAppointmentsClick = () => alert("Ir a Mis Turnos");

  return (
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
        {/* Reservar Turno */}
        <Grid item xs={12} sm={6} md={4} display="flex" justifyContent="center">
          <HoverCard sx={{ width: "100%", maxWidth: 300 }}>
            <CardActionArea onClick={handleReserveClick} sx={{ height: "100%" }}>
              <CardContent sx={{ textAlign: "center", py: 6 }}>
                <CalendarTodayIcon fontSize="large" color="primary" />
                <Typography variant="h6" mt={2}>Reservar Turno</Typography>
              </CardContent>
            </CardActionArea>
          </HoverCard>
        </Grid>

        {/* Mis Turnos */}
        <Grid item xs={12} sm={6} md={4} display="flex" justifyContent="center" >
          <HoverCard sx={{ width: "100%", maxWidth: 300 }}>
            <CardActionArea onClick={handleMyAppointmentsClick} sx={{ height: "100%" }}>
              <CardContent sx={{ textAlign: "center", py: 6 }}>
                <ListAltIcon fontSize="large" color="secondary" />
                <Typography variant="h6" mt={2} px={2.5}>Mis Turnos</Typography>
              </CardContent>
            </CardActionArea>
          </HoverCard>
        </Grid>

        {/* Próximos Turnos */}
        <Grid item xs={12} sm={12} md={4} display="flex" justifyContent="center">
          <Paper elevation={3} sx={{ height: "100%", width: "100%", maxWidth: 300 }}>
            <Typography variant="h6" p={2} borderBottom="1px solid #eee" px={2.5}>
              Próximos Turnos
            </Typography>
            <List>
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
    </Box>
  );
};

export default PatientDashboard;
