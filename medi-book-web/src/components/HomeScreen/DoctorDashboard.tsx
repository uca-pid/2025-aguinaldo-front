import React from "react";
import { Box, Grid, Card, CardActionArea, CardContent, Typography, List, ListItem, ListItemText, Badge } from "@mui/material";
import ScheduleIcon from "@mui/icons-material/Schedule";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { styled } from "@mui/material/styles";

// Simulación de datos
const upcomingAppointments = [
  { date: "15/09/2025", time: "10:30", patient: "María López" },
  { date: "15/09/2025", time: "11:30", patient: "Juan Pérez" },
  { date: "16/09/2025", time: "09:00", patient: "Ana Gómez" }
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

const DoctorDashboard: React.FC = () => {
  const handleViewAppointments = () => alert("Ir a mis turnos");
  const handleSetAvailability = () => alert("Configurar disponibilidad");
  const handlePatientList = () => alert("Ver lista de pacientes");

  return (
    <Box width="100%" display="flex" flexDirection="column" gap={3} alignItems="center">
      <Grid container spacing={3} justifyContent="center" alignItems="stretch">
        {/* Card: Ver turnos */}
        <Grid item xs={12} sm={6} md={4}>
          <HoverCard>
            <CardActionArea onClick={handleViewAppointments} sx={{ height: "100%" }}>
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

        {/* Card: Configurar disponibilidad */}
        <Grid item xs={12} sm={6} md={4}>
          <HoverCard>
            <CardActionArea onClick={handleSetAvailability} sx={{ height: "100%" }}>
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

        {/* Card: Lista de pacientes */}
        <Grid item xs={12} sm={6} md={4}>
          <HoverCard>
            <CardActionArea onClick={handlePatientList} sx={{ height: "100%" }}>
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

        {/* Card: Próximos turnos */}
        <Grid item xs={12} sm={12} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" mb={2} borderBottom="1px solid #eee" pb={1}>
                Próximos Turnos
              </Typography>
              <List>
                {upcomingAppointments.map((appt, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={`${appt.date} - ${appt.time}`}
                      secondary={`Paciente: ${appt.patient}`}
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
    </Box>
  );
};

export default DoctorDashboard;
