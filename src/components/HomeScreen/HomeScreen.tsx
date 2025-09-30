// HomeScreen.tsx
import React from "react";
import { Box, Typography, Paper, Grid} from "@mui/material";
import PatientDashboard from "../Patient/PatientDashboard";
import DoctorDashboard from "../Doctor/DoctorDashboard/DoctorDashboard";
import AdminDashboard from "../Admin/AdminDashboard";
import PendingActivation from "../Doctor/PendingActivation/PendingActivation";
import { useAuthMachine } from "#/providers/AuthProvider";
import { SignInResponse } from "#/models/Auth";

const HomeScreen: React.FC = () => {
  const { authState } = useAuthMachine();
  const user = authState?.context?.authResponse as SignInResponse;

  if (!user) {
    return null;
  }

  const USER_ROLE = user.role;
  const USER_STATUS = user.status;

  const shouldShowPendingActivation = USER_STATUS !== "ACTIVE";

  return (
    <Box
      sx={{
        bgcolor: "#ffffffff",
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
          <Paper>
            {shouldShowPendingActivation ? (
              <PendingActivation />
            ) : (
              <>
                {USER_ROLE === "PATIENT" && <PatientDashboard />}
                {USER_ROLE === "DOCTOR" && <DoctorDashboard />}
                {USER_ROLE === "ADMIN" && <AdminDashboard />}
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Box  textAlign="center">
        <Typography variant="caption" color="text.secondary">
          &copy; 2025 MediBook. Todos los derechos reservados.
        </Typography>
      </Box>
    </Box>
  );
};

export default HomeScreen;
