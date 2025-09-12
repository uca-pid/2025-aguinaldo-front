// HomeScreen.tsx
import React from "react";
import { Box, Typography, Paper, Grid, Avatar, Menu, MenuItem, Divider, ListItemIcon } from "@mui/material";
import { Logout, Person } from "@mui/icons-material";
import { useMachine } from "@xstate/react";
import { homeHeaderMachine } from "../../machines/homeHeaderMachine";
import PatientDashboard from "./userDashboards/PatientDashboard";
import DoctorDashboard from "./userDashboards/DoctorDashboard";
import AdminDashboard from "./userDashboards/AdminDashboard";

const HomeScreen: React.FC = () => {
  const TEST_ROLE = "DOCTOR"; // "PATIENT" | "DOCTOR" | "ADMIN"
  const userName = "Nombre Usuario";

  const dashboards = {
    PATIENT: <PatientDashboard />,
    DOCTOR: <DoctorDashboard />,
    ADMIN: <AdminDashboard />,
  };

  const [state, send] = useMachine(homeHeaderMachine);
  const anchorEl = state.context.anchorEls?.["userMenu"] ?? null;
  const open = Boolean(anchorEl);

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
            onClick={(e) =>
              send({
                type: "OPEN_MENU",
                key: "userMenu",
                anchorEl: e.currentTarget,
              })
            }
          >
            {userName.charAt(0)}
          </Avatar>
          <Typography
            variant="subtitle1"
            fontWeight={500}
            sx={{ cursor: "pointer" }}
            onClick={(e) =>
              send({
                type: "OPEN_MENU",
                key: "userMenu",
                anchorEl: e.currentTarget,
              })
            }
          >
            {userName}
          </Typography>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={() => send({ type: "CLOSE_MENU", key: "userMenu" })}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          PaperProps={{
            elevation: 4,
            sx: {
              mt: 1.5,
              borderRadius: 3,
              minWidth: 200,
            },
          }}
        >
          <MenuItem
            onClick={() => {
              send({ type: "CLOSE_MENU", key: "userMenu" });
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
              send({ type: "CLOSE_MENU", key: "userMenu" });
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
            {dashboards[TEST_ROLE]}
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
