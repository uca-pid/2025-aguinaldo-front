import React from "react";
import { useMachine } from "@xstate/react";
import { useDebouncedCallback } from "use-debounce";
import { Box, Button, Typography, Paper, TextField, Stack, Select, MenuItem, FormControl, FormHelperText, InputLabel } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/es';
import { uiMachine } from "../machines/uiMachine";
import { registerMachine } from "../machines/registerMachine";

const Register: React.FC = () => {
  const [uiState, uiSend] = useMachine(uiMachine);
  const [registerState, registerSend] = useMachine(registerMachine);
  const formContext = uiState.context.toggleStates || {};
  const isPatient = formContext["patient"] ?? true;
  const isIn = formContext["fade"] ?? true;
  const isSuccess = (registerState.context.apiResponse && !registerState.context.apiResponse.error) ?? false;

  const debouncedUpdate = useDebouncedCallback((key: string, value: any) => {
    registerSend({ type: "UPDATE_FORM", key, value });
  }, 250);

  const hasErrorsOrEmpty = () => {
    const values = registerState.context.formValues || {};
    const errors = registerState.context.formErrors || {};
    const keys = isPatient
      ? ["patientNombre", "patientApellido", "patientDni", "patientGenero", "patientFechaNacimiento", "patientEmail", "patientPassword", "patientPasswordConfirm", "patientTelefono"]
      : ["doctorNombre", "doctorApellido", "doctorEspecialidad", "doctorMatricula", "doctorGenero", "doctorFechaNacimiento", "doctorEmail", "doctorPassword", "doctorPasswordConfirm", "doctorTelefono"];

    return keys.some(key => !values[key] || errors[key]);
  };


  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="auto"
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

                <Stack spacing={2}>
                  <TextField
                    label="Nombre"
                    name="patientNombre"
                    fullWidth
                    required
                    onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
                    error={!!registerState.context.formErrors?.patientNombre}
                    helperText={registerState.context.formErrors?.patientNombre || ""}
                  />
                  <TextField
                    label="Apellido"
                    name="patientApellido"
                    fullWidth
                    required
                    onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
                    error={!!registerState.context.formErrors?.patientApellido}
                    helperText={registerState.context.formErrors?.patientApellido || ""}
                  />
                  <TextField
                    label="DNI"
                    name="patientDni"
                    type="number"
                    fullWidth
                    required
                    onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
                    error={!!registerState.context.formErrors?.patientDni}
                    helperText={registerState.context.formErrors?.patientDni || ""}
                  />
                  <FormControl fullWidth required error={!!registerState.context.formErrors?.patientGenero}>
                    <InputLabel id="genero-patient-label">Género</InputLabel>
                    <Select
                      labelId="genero-patient-label"
                      id="genero-patient"
                      name="patientGenero"
                      label="Género"
                      defaultValue=""
                      fullWidth
                      onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
                    >
                      <MenuItem value={"Masculino"}>Masculino</MenuItem>
                      <MenuItem value={"Femenino"}>Femenino</MenuItem>
                    </Select>
                    <FormHelperText>{registerState.context.formErrors?.patientGenero}</FormHelperText>
                  </FormControl>
                  <FormControl fullWidth required>
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                      <DatePicker
                        label="Fecha de Nacimiento"
                        format="DD/MM/YYYY"
                        slotProps={{
                          textField: { required: true, fullWidth: true, name: "patientFechaNacimiento" },
                        }}
                        onChange={(date) => debouncedUpdate("patientFechaNacimiento", date)}
                      />
                    </LocalizationProvider>
                  </FormControl>
                  <TextField
                    label="Número de Teléfono"
                    name="patientTelefono"
                    variant="outlined"
                    required
                    type="number"
                    fullWidth
                    onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
                    error={!!registerState.context.formErrors?.patientTelefono}
                    helperText={registerState.context.formErrors?.patientTelefono || ""}
                  />
                  <TextField
                    label="Email"
                    name="patientEmail"
                    type="email"
                    fullWidth
                    required
                    onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
                    error={!!registerState.context.formErrors?.patientEmail}
                    helperText={registerState.context.formErrors?.patientEmail || ""}
                  />
                  <TextField
                    label="Contraseña"
                    name="patientPassword"
                    type="password"
                    fullWidth
                    required
                    onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
                    error={!!registerState.context.formErrors?.patientPassword}
                    helperText={registerState.context.formErrors?.patientPassword || ""}
                  />
                  <TextField
                    label="Confirmar Contraseña"
                    name="patientPasswordConfirm"
                    type="password"
                    fullWidth
                    required
                    onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
                    error={!!registerState.context.formErrors?.patientPasswordConfirm}
                    helperText={registerState.context.formErrors?.patientPasswordConfirm || ""}
                  />
                </Stack>

              ) : (

                <Stack spacing={2}>
                  <TextField
                    label="Nombre"
                    name="doctorNombre"
                    fullWidth
                    required
                    onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
                    error={!!registerState.context.formErrors?.doctorNombre}
                    helperText={registerState.context.formErrors?.doctorNombre || ""}
                  />
                  <TextField
                    label="Apellido"
                    name="doctorApellido"
                    fullWidth
                    required
                    onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
                    error={!!registerState.context.formErrors?.doctorApellido}
                    helperText={registerState.context.formErrors?.doctorApellido || ""}
                  />
                  <TextField
                    label="Especialidad"
                    name="doctorEspecialidad"
                    fullWidth
                    required
                    onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
                    error={!!registerState.context.formErrors?.doctorEspecialidad}
                    helperText={registerState.context.formErrors?.doctorEspecialidad || ""}
                  />
                  <TextField
                    label="Matrícula"
                    name="doctorMatricula"
                    type="number"
                    fullWidth
                    required
                    onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
                    error={!!registerState.context.formErrors?.doctorMatricula}
                    helperText={registerState.context.formErrors?.doctorMatricula || ""}
                  />
                  <FormControl fullWidth required error={!!registerState.context.formErrors?.doctorGenero}>
                    <InputLabel id="genero-doctor-label">Género</InputLabel>
                    <Select
                      labelId="genero-doctor-label"
                      id="genero-doctor"
                      name="doctorGenero"
                      label="Género"
                      defaultValue=""
                      fullWidth
                      onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
                    >
                      <MenuItem value={"Masculino"}>Masculino</MenuItem>
                      <MenuItem value={"Femenino"}>Femenino</MenuItem>
                    </Select>
                    <FormHelperText>{registerState.context.formErrors?.doctorGenero}</FormHelperText>
                  </FormControl>
                  <FormControl fullWidth required>
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                      <DatePicker
                        label="Fecha de Nacimiento"
                        format="DD/MM/YYYY"
                        slotProps={{
                          textField: { required: true, fullWidth: true, name: "doctorFechaNacimiento" },
                        }}
                        onChange={(date) => debouncedUpdate("doctorFechaNacimiento", date)}
                      />
                    </LocalizationProvider>
                  </FormControl>
                  <TextField
                    label="Número de Teléfono"
                    name="doctorTelefono"
                    variant="outlined"
                    required
                    type="number"
                    fullWidth
                    onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
                    error={!!registerState.context.formErrors?.doctorTelefono}
                    helperText={registerState.context.formErrors?.doctorTelefono || ""}
                  />
                  <TextField
                    label="Email"
                    name="doctorEmail"
                    type="email"
                    fullWidth
                    required
                    onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
                    error={!!registerState.context.formErrors?.doctorEmail}
                    helperText={registerState.context.formErrors?.doctorEmail || ""}
                  />
                  <TextField
                    label="Contraseña"
                    name="doctorPassword"
                    type="password"
                    fullWidth
                    required
                    onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
                    error={!!registerState.context.formErrors?.doctorPassword}
                    helperText={registerState.context.formErrors?.doctorPassword || ""}
                  />
                  <TextField
                    label="Confirmar Contraseña"
                    name="doctorPasswordConfirm"
                    type="password"
                    fullWidth
                    required
                    onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
                    error={!!registerState.context.formErrors?.doctorPasswordConfirm}
                    helperText={registerState.context.formErrors?.doctorPasswordConfirm || ""}
                  />
                </Stack>
              )}

                <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 4 }}
                onClick={() => registerSend({ type: "SUBMIT" })}
                disabled={hasErrorsOrEmpty()}
              >
                Enviar
              </Button>

          </>
        )}
      </Paper>
    </Box>
  );
};

export default Register