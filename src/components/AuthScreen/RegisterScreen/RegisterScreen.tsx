import {
  Box,
  Button,
  Typography,
  Paper,
  Stack,
  useMediaQuery,
  useTheme,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalHospital, Person } from "@mui/icons-material";
import { useAuthMachine } from "#/providers/AuthProvider";
import Logo from "#/assets/favicon.svg";
import dayjs from '#/utils/dayjs.config';
import 'dayjs/locale/es';
import "./RegisterScreen.css";

dayjs.locale('es');

function RegisterScreen() {
  const { authState, authSend } = useAuthMachine();
  const authContext = authState.context;

  const isPatient = authContext.isPatient;
  
  const isSuccess = authContext.authResponse && 'message' in authContext.authResponse && !('error' in authContext.authResponse);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    authSend({ type: "SUBMIT" });
  };

  return (
    <Box className="auth-container">
      <Paper
        elevation={12}
        className={`auth-paper register-paper ${isMobile ? 'auth-paper--mobile' : ''}`}
      >
        {!isMobile && (
          <Box className="auth-left-section">
            <Box display="flex" alignItems="center" justifyContent="center" mb={3}>
              <img
                src={Logo}
                alt="MediBook Logo"
                style={{ width: '40px', height: '40px', marginRight: '12px' }}
              />
              <Typography variant="h3" className="auth-title" style={{ margin: 0 }}>
                MediBook
              </Typography>
            </Box>
            <Typography variant="h6" color="text.secondary" className="auth-subtitle">
              Sistema de Gestión de Turnos Médicos
            </Typography>
            <Typography variant="body1" color="text.secondary" className="auth-description" sx={{ mb: 4 }}>
              Únete a nuestra plataforma para gestionar turnos médicos de manera eficiente.
            </Typography>
            
            <Stack spacing={2} className="register-feature-cards">
              <Card className="register-feature-card">
                <Box className="register-feature-header">
                  <Person className="register-feature-icon register-feature-icon--patient" />
                  <Typography variant="h6" className="register-feature-title">Para Pacientes</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" className="register-feature-description">
                  Reserva y gestiona tus citas médicas fácilmente
                </Typography>
              </Card>
              
              <Card className="register-feature-card">
                <Box className="register-feature-header">
                  <LocalHospital className="register-feature-icon register-feature-icon--doctor" />
                  <Typography variant="h6" className="register-feature-title">Para Médicos</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" className="register-feature-description">
                  Administra tu agenda y atiende a tus pacientes
                </Typography>
              </Card>
            </Stack>
          </Box>
        )}

        {!isMobile && <Divider orientation="vertical" flexItem className="auth-divider" />}

        <Box className="auth-right-section register-right-section">
          {isMobile && (
            <Box className="auth-mobile-header">
              <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                <img
                  src={Logo}
                  alt="MediBook Logo"
                  style={{ width: '30px', height: '30px', marginRight: '8px' }}
                />
                <Typography variant="h4" className="auth-mobile-title" style={{ margin: 0 }}>
                  MediBook
                </Typography>
              </Box>
            </Box>
          )}
          
          {isSuccess ? (
            <Box className="auth-success-container">
              <Typography variant="h4" className="auth-success-emoji">🎉</Typography>
              <Typography variant="h5" fontWeight={600} color="success.main" className="auth-success-title register-success-message">
                ¡Registro exitoso!
              </Typography>
              <Typography variant="body1" color="text.secondary" className="register-success-description">
                Tu cuenta ha sido creada correctamente
              </Typography>
            </Box>
          ) : (
            <Card elevation={0} sx={{ backgroundColor: 'transparent' }}>
              <CardContent sx={{ p: 0 }}>
                <Typography
                  variant="h4"
                  className="auth-form-title"
                >
                  Crear Cuenta
                </Typography>

                <Stack
                  direction={isMobile ? "column" : "row"}
                  spacing={2}
                  justifyContent="center"
                  className="register-user-type-chips"
                >
                  <Chip
                    icon={<Person />}
                    label="Paciente"
                    variant={isPatient ? "filled" : "outlined"}
                    onClick={() => authSend({ type: "TOGGLE_USER_TYPE", isPatient: true})}
                    className={`register-chip ${isPatient ? 'register-chip--patient' : ''}`}
                  />
                  <Chip
                    icon={<LocalHospital />}
                    label="Médico"
                    variant={!isPatient ? "filled" : "outlined"}
                    onClick={() => authSend({ type: "TOGGLE_USER_TYPE", isPatient: false})}
                    className={`register-chip ${!isPatient ? 'register-chip--doctor' : ''}`}
                  />
                </Stack>

                <Box component="form" onSubmit={handleSubmit}>
                  <Stack className="register-form-stack">
                  <Stack direction={isMobile ? "column" : "row"} spacing={2} className="register-form-row">
                    <TextField
                      label="Nombre"
                      name="name"
                      fullWidth
                      required
                      value={authContext.formValues.name || ""}
                      onChange={(e) => authSend({ type: "UPDATE_FORM", key: "name", value: e.target.value })}
                      error={!!authContext.formErrors?.name}
                      helperText={authContext.formErrors?.name || " "}
                      className="auth-field"
                    />
                    <TextField
                      label="Apellido"
                      name="surname"
                      fullWidth
                      required
                      value={authContext.formValues.surname || ""}
                      onChange={(e) => authSend({ type: "UPDATE_FORM", key: "surname", value: e.target.value })}
                      error={!!authContext.formErrors?.surname}
                      helperText={authContext.formErrors?.surname || " "}
                      className="auth-field"
                    />
                  </Stack>

                  <Stack direction={isMobile ? "column" : "row"} spacing={2} className="register-form-row">
                    <TextField
                      label="DNI"
                      name="dni"
                      type="number"
                      fullWidth
                      required
                      value={authContext.formValues.dni || ""}
                      onChange={(e) => authSend({ type: "UPDATE_FORM", key: "dni", value: e.target.value })}
                      error={!!authContext.formErrors?.dni}
                      helperText={authContext.formErrors?.dni || " "}
                      className="auth-field"
                    />
                    <FormControl
                      fullWidth
                      required
                      error={!!authContext.formErrors?.gender}
                      className="auth-field register-form-control"
                    >
                      <InputLabel id="genero-label">Género</InputLabel>
                      <Select
                        labelId="genero-label"
                        id="genero"
                        name="gender"
                        value={authContext.formValues.gender || ""}
                        label="Género"
                        fullWidth
                        onChange={(e) => authSend({ type: "UPDATE_FORM", key: "gender", value: e.target.value })}
                      >
                        <MenuItem value={"MALE"}>Masculino</MenuItem>
                        <MenuItem value={"FEMALE"}>Femenino</MenuItem>
                      </Select>
                      <FormHelperText>
                        {authContext.formErrors?.gender || " "}
                      </FormHelperText>
                    </FormControl>
                  </Stack>

                  <Stack direction={isMobile ? "column" : "row"} spacing={2} className="register-form-row">
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                      <DatePicker
                        label="Fecha de Nacimiento"
                        format="DD/MM/YYYY"
                        value={authContext.formValues.birthdate ? dayjs(authContext.formValues.birthdate) : null}
                        maxDate={dayjs().subtract(18, 'year')}
                        minDate={dayjs().subtract(120, 'year')}
                        views={['year', 'month', 'day']}
                        openTo="year"
                        onChange={(date) => authSend({ 
                          type: "UPDATE_FORM", 
                          key: "birthdate", 
                          value: date ? date.toISOString() : null 
                        })}
                        slotProps={{
                          textField: {
                            required: true,
                            fullWidth: true,
                            name: "birthdate",
                            error: !!authContext.formErrors?.birthdate,
                            helperText: authContext.formErrors?.birthdate || " ",
                            className: "auth-field",
                            placeholder: "DD/MM/YYYY"
                          },
                          field: {
                            clearable: true
                          }
                        }}
                      />
                    </LocalizationProvider>
                    <TextField
                      label="Número de Teléfono"
                      name="phone"
                      type="tel"
                      fullWidth
                      required
                      value={authContext.formValues.phone || ""}
                      onChange={(e) => authSend({ type: "UPDATE_FORM", key: "phone", value: e.target.value })}
                      error={!!authContext.formErrors?.phone}
                      helperText={authContext.formErrors?.phone || " "}
                      className="auth-field"
                    />
                  </Stack>

                  <TextField
                    label="Correo Electrónico"
                    name="email"
                    type="email"
                    fullWidth
                    required
                    value={authContext.formValues.email || ""}
                    onChange={(e) => authSend({ type: "UPDATE_FORM", key: "email", value: e.target.value })}
                    error={!!authContext.formErrors?.email}
                    helperText={authContext.formErrors?.email || " "}
                    className="auth-field"
                  />

                  <Stack direction={isMobile ? "column" : "row"} spacing={2} className="register-form-row">
                    <TextField
                      label="Contraseña"
                      name="password"
                      type="password"
                      fullWidth
                      required
                      value={authContext.formValues.password || ""}
                      onChange={(e) => authSend({ type: "UPDATE_FORM", key: "password", value: e.target.value })}
                      error={!!authContext.formErrors?.password}
                      helperText={authContext.formErrors?.password || " "}
                      className="auth-field"
                    />
                    <TextField
                      label="Confirmar Contraseña"
                      name="password_confirm"
                      type="password"
                      fullWidth
                      required
                      value={authContext.formValues.password_confirm || ""}
                      onChange={(e) => authSend({ type: "UPDATE_FORM", key: "password_confirm", value: e.target.value })}
                      error={!!authContext.formErrors?.password_confirm}
                      helperText={authContext.formErrors?.password_confirm || " "}
                      className="auth-field"
                    />
                  </Stack>

                  {/* Doctor-specific fields */}
                  {!isPatient && (
                    <Box className="register-doctor-section">
                      <Typography variant="h6" className="register-doctor-title">
                        Información Profesional
                      </Typography>
                      <Stack spacing={0}>
                        <Stack direction={isMobile ? "column" : "row"} spacing={2} className="register-form-row">
                          <TextField
                            label="Especialidad"
                            name="specialty"
                            fullWidth
                            required
                            value={authContext.formValues.specialty || ""}
                            onChange={(e) => authSend({ type: "UPDATE_FORM", key: "specialty", value: e.target.value })}
                            error={!!authContext.formErrors?.specialty}
                            helperText={authContext.formErrors?.specialty || " "}
                            className="auth-field"
                          />
                          <TextField
                            label="Matrícula Médica"
                            name="medicalLicense"
                            fullWidth
                            required
                            value={authContext.formValues.medicalLicense || ""}
                            onChange={(e) => authSend({ type: "UPDATE_FORM", key: "medicalLicense", value: e.target.value })}
                            error={!!authContext.formErrors?.medicalLicense}
                            helperText={authContext.formErrors?.medicalLicense || " "}
                            className="auth-field"
                          />
                        </Stack>
                        <TextField
                          label="Duración de los turnos (minutos)"
                          name="slotDurationMin"
                          type="number"
                          fullWidth
                          required
                          value={authContext.formValues.slotDurationMin || ""}
                          onChange={(e) => authSend({ type: "UPDATE_FORM", key: "slotDurationMin", value: parseInt(e.target.value) || null })}
                          error={!!authContext.formErrors?.slotDurationMin}
                          helperText={authContext.formErrors?.slotDurationMin || ""}
                          className="auth-field"
                          inputProps={{
                            min: 15,
                            max: 180,
                            step: 15
                          }}
                        />
                      </Stack>
                    </Box>
                  )}

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={authContext.loading || authContext.hasErrorsOrEmpty}
                    className="auth-submit-button"
                  >
                    {authContext.loading ? "Creando cuenta..." : "Crear Cuenta"}
                  </Button>

                  <Box className="auth-toggle-container">
                    <Typography variant="body2" color="text.secondary">
                      ¿Ya tienes cuenta?{" "}
                      <Button
                        variant="text"
                        onClick={() => authSend({ type: "TOGGLE_MODE", mode: "login" })}
                        className="auth-toggle-button"
                      >
                        Inicia sesión aquí
                      </Button>
                    </Typography>
                  </Box>

                  {authContext.authResponse && 'error' in authContext.authResponse && (
                    <Box className="auth-error-box">
                      <Typography variant="body2" color="error" className="auth-message-text">
                        {authContext.authResponse.error || authContext.authResponse.message || 'Error en el registro'}
                      </Typography>
                    </Box>
                  )}

                  {authContext.authResponse && 'message' in authContext.authResponse && !('error' in authContext.authResponse) && (
                    <Box className="auth-success-box">
                      <Typography variant="body2" color="success.main" className="auth-message-text">
                        {authContext.authResponse.message}
                      </Typography>
                    </Box>
                  )}
                </Stack>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default RegisterScreen;
