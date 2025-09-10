import React from "react";
import { useMachine } from "@xstate/react";
import { Box, Button, Typography, Paper, TextField, Stack } from "@mui/material";
import { uiMachine } from "../../machines/uiMachine";

const Register: React.FC = () => {
  const [uiState, uiSend] = useMachine(uiMachine);
  const fromContext = uiState.context.toggleStates || {};
  const isPatient = fromContext["patient"] ?? true;
  const isIn = fromContext["fade"] ?? true;

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
          opacity: isIn ? 1 : 0,
          transition: "opacity 0.3s",
        }}
      >
        <Typography variant="h5" mb={3} fontWeight={600}>
          Register as ...
        </Typography>

        <Stack direction="row" spacing={2} justifyContent="center" mb={4}>
          <Button
            variant={isPatient ? "contained" : "outlined"}
            onClick={() => uiSend({ type: "TOGGLE", key: "patient" })}
            fullWidth
          >
            Patient
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

export default Register