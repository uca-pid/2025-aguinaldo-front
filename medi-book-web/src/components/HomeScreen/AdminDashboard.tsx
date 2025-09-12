import React from "react";
import { Box, Grid, Card, CardActionArea, CardContent, Typography, List, ListItem, ListItemText, Badge } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import { styled } from "@mui/material/styles";

// Simulación de datos
const pendingDoctors = [
  { name: "Dr. Juan Pérez", specialty: "Cardiología" },
  { name: "Dra. Ana Gómez", specialty: "Pediatría" }
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

const AdminDashboard: React.FC = () => {
  const handlePatients = () => alert("Ir a Gestión de Pacientes");
  const handleDoctors = () => alert("Ir a Gestión de Médicos");
  const handlePendingDoctors = () => alert("Ir a Médicos Pendientes de Aprobación");

  return (
    <Box width="100%" display="flex" flexDirection="column" gap={3} alignItems="center">
      <Grid container spacing={3} justifyContent="center" alignItems="stretch">
        {/* Card: Pacientes */}
        <Grid item xs={12} sm={6} md={4}>
          <HoverCard>
            <CardActionArea onClick={handlePatients} sx={{ height: "100%" }}>
              <CardContent sx={{ textAlign: "center", py: 6 }}>
                <PeopleIcon fontSize="large" color="primary" />
                <Typography variant="h6" mt={2}>
                  Pacientes
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Ver y gestionar pacientes registrados
                </Typography>
              </CardContent>
            </CardActionArea>
          </HoverCard>
        </Grid>

        {/* Card: Médicos */}
        <Grid item xs={12} sm={6} md={4}>
          <HoverCard>
            <CardActionArea onClick={handleDoctors} sx={{ height: "100%" }}>
              <CardContent sx={{ textAlign: "center", py: 6 }}>
                <PeopleIcon fontSize="large" color="secondary" />
                <Typography variant="h6" mt={2}>
                  Médicos
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Ver y gestionar médicos registrados
                </Typography>
              </CardContent>
            </CardActionArea>
          </HoverCard>
        </Grid>

        {/* Card: Médicos Pendientes de Aprobación */}
        <Grid item xs={12} sm={12} md={4}>
          <Badge badgeContent={pendingDoctors.length} color="primary" sx={{ width: "100%" }}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6" mb={2} borderBottom="1px solid #eee" pb={1}>
                  Médicos Pendientes de Aprobación
                </Typography>
                <List>
                  {pendingDoctors.map((doc, index) => (
                    <ListItem key={index} divider button onClick={handlePendingDoctors}>
                      <ListItemText
                        primary={doc.name}
                        secondary={doc.specialty}
                      />
                    </ListItem>
                  ))}
                  {pendingDoctors.length === 0 && (
                    <Typography variant="body2">No hay médicos pendientes</Typography>
                  )}
                </List>
              </CardContent>
            </Card>
          </Badge>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
