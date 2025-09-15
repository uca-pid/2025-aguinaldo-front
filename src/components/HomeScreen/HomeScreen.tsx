// HomeScreen.tsx
import React from "react";
import { Box, Typography, Paper, Grid} from "@mui/material";
import PatientDashboard from "./userDashboards/Patient/PatientDashboard";
import DoctorDashboard from "./userDashboards/Doctor/DoctorDashboard";
import AdminDashboard from "../Admin/AdminDashboard";
import { useAuthMachine } from "#/providers/AuthProvider";
import { SignInResponse } from "#/models/Auth";

const HomeScreen: React.FC = () => {
  const { auth } = useAuthMachine();
  const user = auth.authResponse as SignInResponse;

  const USER_ROLE = user.role;


  return (
    <Box
      sx={{
        bgcolor: "#ffffffff",
        p: 3,
      }}
    >

      <Grid
        container
        spacing={3}
        width="100%"
        justifyContent="center"
        alignItems="stretch"
      >
        <Grid width="100%">
          <Paper elevation={6} sx={{ p: 4, borderRadius: 3 }}>
            {USER_ROLE === "PATIENT" && <PatientDashboard />}
            {USER_ROLE === "DOCTOR" && <DoctorDashboard />}
            {USER_ROLE === "ADMIN" && <AdminDashboard />}
          </Paper>
        </Grid>
      </Grid>

      <Box mt={5} textAlign="center">
        <Typography variant="caption" color="text.secondary">
          &copy; 2025 MediBook. Todos los derechos reservados.
        </Typography>
      </Box>
    </Box>
  );
};

export default HomeScreen;
