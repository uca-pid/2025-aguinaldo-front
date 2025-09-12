// HomeScreen.tsx
import React from "react";
import { Box, Typography, Paper, Grid, Avatar, Badge } from "@mui/material";
import PatientDashboard from "../components/HomeScreen/PatientDashboard";
import DoctorDashboard from "../components/HomeScreen/DoctorDashboard";
import AdminDashboard from "../components/HomeScreen/AdminDashboard";

// Cambiá aquí para probar los distintos roles
const TEST_ROLE: "PATIENT" | "DOCTOR" | "ADMIN" = "PATIENT";

const HomeScreen: React.FC = () => {
  // Datos simulados
  const userName = "Nombre Usuario";

  return (
    <Box
      sx={{
        bgcolor: "#f5f5f5",
        p: 3,
      }}
    >
      {/* Header */}
      <Paper
        elevation={3}
        sx={{
            mb: 4,
            p: { xs: 2, sm: 3 },
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
        }}
        >
        {/* Izquierda: Logo / nombre de la app */}
        <Typography
            variant="h5"
            fontWeight={700}
            sx={{ cursor: "pointer", userSelect: "none" }}
            onClick={() => alert("Ir al inicio")}
        >
            MediBook
        </Typography>

        {/* Derecha: botones de usuario */}
        <Box
            display="flex"
            alignItems="center"
            gap={2}
            flexWrap="wrap"
        >
            {/* Botón Mi perfil */}
            <Box
            display="flex"
            alignItems="center"
            gap={1}
            sx={{
                cursor: "pointer",
                "&:hover": { opacity: 0.8, transform: "scale(1.03)", transition: "all 0.2s" },
            }}
            onClick={() => alert("Ir al perfil")}
            >
            <Avatar>{userName.charAt(0)}</Avatar>
            <Typography variant="subtitle1" fontWeight={500}>
                {userName}
            </Typography>
            </Box>

            {/* Botón Cerrar sesión */}
            <Box
            sx={{
                px: 2,
                py: 1,
                bgcolor: "#7db9d4ff",
                color: "white",
                borderRadius: 2,
                cursor: "pointer",
                "&:hover": { bgcolor: "#406574ff", transform: "scale(1.03)", transition: "all 0.2s" },
            }}
            onClick={() => alert("Cerrar sesión")}
            >
            <Typography variant="subtitle2" fontWeight={500}>
                Cerrar sesión
            </Typography>
            </Box>
        </Box>
        </Paper>


      <Grid container spacing={3} width="100%" justifyContent="center" alignItems="stretch">
        <Grid item xs={12} md={8} width="100%">
          <Paper elevation={6} sx={{ p: 4, borderRadius: 3 }} >
            {TEST_ROLE === "PATIENT" && <PatientDashboard />}
            {TEST_ROLE === "DOCTOR" && <DoctorDashboard />}
            {TEST_ROLE === "ADMIN" && <AdminDashboard />}
          </Paper>
        </Grid>
      </Grid>

      {/* Footer */}
      <Box mt={5} textAlign="center">
        <Typography variant="caption" color="text.secondary">
            &copy; 2025 MediBook. Todos los derechos reservados.
        </Typography>
      </Box>
    </Box>
  );
};

export default HomeScreen;
