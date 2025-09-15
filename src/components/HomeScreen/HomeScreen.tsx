// HomeScreen.tsx
import React from "react";
import { Box, Typography, Paper, Grid, Avatar, Menu, MenuItem, Divider, ListItemIcon } from "@mui/material";
import { Logout, Person } from "@mui/icons-material";
import PatientDashboard from "./userDashboards/Patient/PatientDashboard";
import DoctorDashboard from "./userDashboards/Doctor/DoctorDashboard";
import AdminDashboard from "./userDashboards/AdminDashboard";
import { useMachines } from "#/providers/MachineProvider";
import { useAuthMachine } from "#/providers/AuthProvider";
import { SignInResponse } from "#/models/Auth";

const HomeScreen: React.FC = () => {
  const { auth } = useAuthMachine();
  const user = auth.authResponse as SignInResponse;
  const {ui} = useMachines();
  const { context: uiContext, send: uiSend } = ui;

  const USER_ROLE = user.role;
  const userName = user.name;

  const open = Boolean(uiContext.toggleStates?.["userMenu"]);

  return (
    <Box
      sx={{
        bgcolor: "#ffffffff",
        p: 3,
      }}
    >
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
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{ cursor: "pointer", userSelect: "none" }}
          onClick={() => alert("Ir al inicio")}
        >
          MediBook
        </Typography>

        <Box display="flex" alignItems="center" gap={1}>
          <Avatar
            sx={{ cursor: "pointer" }}
            onClick={() =>
              uiSend({
                type: "TOGGLE",
                key: "userMenu",
              })
            }
          >
            {userName.charAt(0)}
          </Avatar>
          <Typography
            variant="subtitle1"
            fontWeight={500}
            sx={{ cursor: "pointer" }}
            onClick={() =>
              uiSend({
                type: "TOGGLE",
                key: "userMenu",
              })
            }
          >
            {userName}
          </Typography>
        </Box>

        <Menu
          open={open}
          onClose={() => uiSend({ type: "TOGGLE", key: "userMenu" })}
          anchorOrigin={{ horizontal: "right", vertical: "top" }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          PaperProps={{
            elevation: 4,
            sx: {
              mt: 1.5,
              borderRadius: 3,
              minWidth: 200,
              position: "absolute",
              top: 60,
              right: 20,
            },
          }}
        >
          <MenuItem
            onClick={() => {
              uiSend({ type: "TOGGLE", key: "userMenu" });
              alert("Ir al perfil");
            }}
          >
            <ListItemIcon>
              <Person fontSize="small" />
            </ListItemIcon>
            Mi perfil
          </MenuItem>

          <Divider />

          <MenuItem
            onClick={() => {
              uiSend({ type: "TOGGLE", key: "userMenu" });
              alert("Cerrar sesión");
            }}
            sx={{ color: "error.main" }}
          >
            <ListItemIcon>
              <Logout fontSize="small" color="error" />
            </ListItemIcon>
            Cerrar sesión
          </MenuItem>
        </Menu>
      </Paper>

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
