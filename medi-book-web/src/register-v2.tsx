import React from "react";
import { useMachine } from "@xstate/react";
import { Box, Button, Typography, Paper, TextField, Stack } from "@mui/material";
import { registerMachine } from "./machines/registerMachine";

export const Register: React.FC = () => {
  const [state, send] = useMachine(registerMachine);

  // Función para cambiar de formulario con fade
  const handleSwitch = (formType: "patient" | "doctor") => {
  // Si ya estamos en ese formulario, no hacer nada
  if (state.context.formType === formType) return;

  // Fade out
  send({ type: "SWITCH_FORM", formType });

  // Después de la animación, cambiar el formulario
  setTimeout(() => {
    send({ type: "FADE_OUT_DONE" });
  }, 300); // Duración del fade en ms
};


  const isPatient = state.context.formType === "patient";

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      bgcolor="#f5f5f5"
    >
      <Paper
        elevation={6}
        sx={{
          p: 5,
          width: 400,
          textAlign: "center",
          borderRadius: 3,
          opacity: state.context.fade === "in" ? 1 : 0,
          transition: "opacity 0.3s",
        }}
      >
        <Typography variant="h5" mb={3} fontWeight={600}>
          Register as ...
        </Typography>

        <Stack direction="row" spacing={2} justifyContent="center" mb={4}>
          <Button
            variant={isPatient ? "contained" : "outlined"}
            onClick={() => handleSwitch("patient")}
            fullWidth
          >
            Patient
          </Button>
          <Button
            variant={!isPatient ? "contained" : "outlined"}
            onClick={() => handleSwitch("doctor")}
            fullWidth
          >
            Doctor
          </Button>
        </Stack>

        {isPatient ? (
          <Stack spacing={2}>
            <TextField label="Nombre del paciente" fullWidth />
            <TextField label="Email" type="email" fullWidth />
            <TextField label="Contraseña" type="password" fullWidth />
          </Stack>
        ) : (
          <Stack spacing={2}>
            <TextField label="Nombre del doctor" fullWidth />
            <TextField label="Email" type="email" fullWidth />
            <TextField label="Especialidad" fullWidth />
            <TextField label="Contraseña" type="password" fullWidth />
          </Stack>
        )}

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 4 }}
        >
          Submit
        </Button>
      </Paper>
    </Box>
  );
};
