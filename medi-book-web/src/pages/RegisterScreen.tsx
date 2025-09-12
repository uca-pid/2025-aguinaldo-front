import React from "react";
import { useMachine } from "@xstate/react";
import { Box, Button, Typography, Paper, Stack } from "@mui/material";
import { uiMachine } from "../machines/uiMachine";
import { registerMachine } from "../machines/registerMachine";
import PatientRegisterForm from "../components/register/PatientRegisterForm";
import DoctorRegisterForm from "../components/register/DoctorRegisterForm";

const RegisterScreen: React.FC = () => {
  const [uiState, uiSend] = useMachine(uiMachine);
  const [registerState, registerSend] = useMachine(registerMachine);

  const formContext = uiState.context.toggleStates || {};
  const isPatient = formContext["patient"] ?? true;
  const isIn = formContext["fade"] ?? true;
  const isSuccess = (registerState.context.apiResponse && !registerState.context.apiResponse.error) ?? false;

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      bgcolor="#f5f5f5"
    >
      <Paper
        elevation={6}
        sx={{
          p: 5,
          width: 400,
          textAlign: "center",
          borderRadius: 3,
          opacity: isIn ? 1 : 0,
          transition: "opacity 0.3s",
        }}
      >
        {isSuccess ? (
          <Typography variant="h5" fontWeight={600} color="green">
            Registro exitoso!
          </Typography>
        ) : (
          <>
            <Typography variant="h5" mb={3} fontWeight={600}>
              Registrarse como ...
            </Typography>

            <Stack direction="row" spacing={2} justifyContent="center" mb={4}>
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
              <PatientRegisterForm registerState={registerState} registerSend={registerSend} />
            ) : (
              <DoctorRegisterForm registerState={registerState} registerSend={registerSend} />
            )}
          </>
        )}
      </Paper>
    </Box>
  );
};

export default RegisterScreen;
