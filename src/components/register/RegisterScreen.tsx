import React from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Stack,
  useMediaQuery,
  useTheme,
  Divider,
} from "@mui/material";
import PatientRegisterForm from "./userForms/PatientRegisterForm";
import DoctorRegisterForm from "./userForms/DoctorRegisterForm";
import { useMachines } from "../../providers/MachineProvider";

const RegisterScreen: React.FC = () => {
  const { ui, register } = useMachines();
  const { context: uiContext, send: uiSend } = ui;
  const { context: registerContext } = register;

  const formContext = uiContext.toggleStates || {};
  const isPatient = formContext["patient"] ?? true;
  const isIn = formContext["fade"] ?? true;
  const isSuccess =
    (registerContext.apiResponse && !registerContext.apiResponse.error) ?? false;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f5f5f5"
      p={2}
    >
      <Paper
        elevation={6}
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          p: { xs: 3, sm: 5 },
          width: "100%",
          maxWidth: 900,
          borderRadius: 3,
          opacity: isIn ? 1 : 0,
          transition: "opacity 0.3s",
        }}
      >
        {!isMobile && (
          <Box flex={0.8} textAlign="center">
            <Typography variant="h4" fontWeight={700} mb={2}>
              Bienvenido a MediBook
            </Typography>
            <Typography variant="body1" color="text.secondary" px={4}>
              Registrate como paciente para reservar turnos fácilmente
              o como doctor para gestionar tus consultas.
            </Typography>
          </Box>
        )}

        {!isMobile && <Divider orientation="vertical" flexItem />}

        <Box flex={1} width="100%">
          {isSuccess ? (
            <Typography variant="h5" fontWeight={600} color="success.main" textAlign="center">
              🎉 Registro exitoso!
            </Typography>
          ) : (
            <>
              <Typography
                variant="h5"
                mb={3}
                fontWeight={600}
                textAlign="center"
              >
                Registrarse como...
              </Typography>

              <Stack
                direction={isMobile ? "column" : "row"}
                spacing={2}
                justifyContent="center"
                mb={4}
              >
                <Button
                  variant={isPatient ? "contained" : "outlined"}
                  onClick={() => uiSend({ type: "TOGGLE", key: "patient" })}
                  fullWidth
                >
                  Paciente
                </Button>
                <Button
                  variant={!isPatient ? "contained" : "outlined"}
                  onClick={() => uiSend({ type: "TOGGLE", key: "patient" })}
                  fullWidth
                >
                  Doctor
                </Button>
              </Stack>

              {isPatient ? (
                <PatientRegisterForm />
              ) : (
                <DoctorRegisterForm />
              )}
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default RegisterScreen;
