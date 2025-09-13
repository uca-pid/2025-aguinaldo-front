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
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useMachines } from "../../providers/MachineProvider";

const RegisterScreen: React.FC = () => {
  const { ui, register } = useMachines();
  const { context: uiContext } = ui;
  const { context: registerContext, send: registerSend } = register;

  const formContext = uiContext.toggleStates || {};
  const isPatient = registerContext.isPatient;
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
                  onClick={() => registerSend({ type: "TOGGLE_USER_TYPE", isPatient: true})}
                  fullWidth
                >
                  Paciente
                </Button>
                <Button
                  variant={!isPatient ? "contained" : "outlined"}
                  onClick={() => registerSend({ type: "TOGGLE_USER_TYPE", isPatient: false})}
                  fullWidth
                >
                  Doctor
                </Button>
              </Stack>

              <Grid>
                <Stack spacing={2}>
                  <TextField
                    label="Nombre"
                    name="name"
                    fullWidth
                    required
                    value={registerContext.formValues.name || ""}
                    onChange={(e) => registerSend({ type: "UPDATE_FORM", key: "name", value: e.target.value })}
                    error={!!registerContext.formErrors?.name}
                    helperText={registerContext.formErrors?.name || ""}
                  />
                  <TextField
                    label="Apellido"
                    name="surname"
                    fullWidth
                    required
                    value={registerContext.formValues.surname || ""}
                    onChange={(e) => registerSend({ type: "UPDATE_FORM", key: "surname", value: e.target.value })}
                    error={!!registerContext.formErrors?.surname}
                    helperText={registerContext.formErrors?.surname || ""}
                  />
                  <TextField
                    label="DNI"
                    name="dni"
                    type="number"
                    fullWidth
                    required
                    value={registerContext.formValues.dni || ""}
                    onChange={(e) => registerSend({ type: "UPDATE_FORM", key: "dni", value: e.target.value })}
                    error={!!registerContext.formErrors?.dni}
                    helperText={registerContext.formErrors?.dni || ""}
                  />
                  <FormControl
                    fullWidth
                    required
                    error={!!registerContext.formErrors?.gender}
                  >
                    <InputLabel id="genero-label">Género</InputLabel>
                    <Select
                      labelId="genero-label"
                      id="genero"
                      name="gender"
                      value={registerContext.formValues.gender || ""}
                      label="Género"
                      fullWidth
                      onChange={(e) => registerSend({ type: "UPDATE_FORM", key: "gender", value: e.target.value })}
                    >
                      <MenuItem value={"Masculino"}>Masculino</MenuItem>
                      <MenuItem value={"Femenino"}>Femenino</MenuItem>
                    </Select>
                    <FormHelperText>
                      {registerContext.formErrors?.gender}
                    </FormHelperText>
                  </FormControl>
                  <FormControl fullWidth required>
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                      <DatePicker
                        label="Fecha de Nacimiento"
                        format="DD/MM/YYYY"
                        slotProps={{
                          textField: {
                            required: true,
                            fullWidth: true,
                            name: "birthdate",
                          },
                        }}
                        onChange={(date) => registerSend({ type: "UPDATE_FORM", key: "birthdate", value: date ? date.toISOString() : null })}
                      />
                    </LocalizationProvider>
                  </FormControl>
                  <TextField
                    label="Número de Teléfono"
                    name="phone"
                    type="tel"
                    fullWidth
                    required
                    value={registerContext.formValues.phone || ""}
                    onChange={(e) => registerSend({ type: "UPDATE_FORM", key: "phone", value: e.target.value })}
                    error={!!registerContext.formErrors?.phone}
                    helperText={registerContext.formErrors?.phone || ""}
                  />
                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    fullWidth
                    required
                    value={registerContext.formValues.email || ""}
                    onChange={(e) => registerSend({ type: "UPDATE_FORM", key: "email", value: e.target.value })}
                    error={!!registerContext.formErrors?.email}
                    helperText={registerContext.formErrors?.email || ""}
                  />
                  <TextField
                    label="Contraseña"
                    name="password"
                    type="password"
                    fullWidth
                    required
                    value={registerContext.formValues.password || ""}
                    onChange={(e) => registerSend({ type: "UPDATE_FORM", key: "password", value: e.target.value })}
                    error={!!registerContext.formErrors?.password}
                    helperText={registerContext.formErrors?.password || ""}
                  />
                  <TextField
                    label="Confirmar Contraseña"
                    name="password_confirm"
                    type="password"
                    fullWidth
                    required
                    value={registerContext.formValues.password_confirm || ""}
                    onChange={(e) => registerSend({ type: "UPDATE_FORM", key: "password_confirm", value: e.target.value })}
                    error={!!registerContext.formErrors?.password_confirm}
                    helperText={
                      registerContext.formErrors?.password_confirm || ""
                    }
                  />

                  {/* Doctor-specific fields */}
                  {!isPatient && (
                    <>
                      <TextField
                        label="Especialidad"
                        name="specialty"
                        fullWidth
                        required
                        value={registerContext.formValues.specialty || ""}
                        onChange={(e) => registerSend({ type: "UPDATE_FORM", key: "specialty", value: e.target.value })}
                        error={!!registerContext.formErrors?.specialty}
                        helperText={registerContext.formErrors?.specialty || ""}
                      />
                      <TextField
                        label="Matrícula Médica"
                        name="medicalLicense"
                        fullWidth
                        required
                        value={registerContext.formValues.medicalLicense || ""}
                        onChange={(e) => registerSend({ type: "UPDATE_FORM", key: "medicalLicense", value: e.target.value })}
                        error={!!registerContext.formErrors?.medicalLicense}
                        helperText={registerContext.formErrors?.medicalLicense || ""}
                      />
                      <TextField
                        label="Duración de turno (minutos)"
                        name="slotDurationMin"
                        type="number"
                        fullWidth
                        value={registerContext.formValues.slotDurationMin || ""}
                        onChange={(e) => registerSend({ type: "UPDATE_FORM", key: "slotDurationMin", value: parseInt(e.target.value) })}
                        error={!!registerContext.formErrors?.slotDurationMin}
                        helperText={registerContext.formErrors?.slotDurationMin || ""}
                      />
                    </>
                  )}
                </Stack>

                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 4 }}
                  onClick={() => registerSend({ type: "SUBMIT" })}
                  disabled={registerContext.apiResponse?.loading || registerContext.hasErrorsOrEmpty}
                >
                  {registerContext.apiResponse?.loading ? "Enviando..." : "Enviar"}
                </Button>
              </Grid>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default RegisterScreen;