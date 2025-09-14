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
  TextField,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Avatar,
  Card,
  CardContent,
} from "@mui/material";
import { Visibility, VisibilityOff, LocalHospital, Person } from "@mui/icons-material";
import { useMachines } from "../../../providers/MachineProvider";
import Logo from "../../../assets/MediBook-Logo.png";
import { useAuthMachine } from "../../../providers/AuthProvider";
import "./LoginScreen.css";

function LoginScreen() {
  const { auth } = useAuthMachine();
  const { ui } = useMachines();
  const { context: uiContext, send: uiSend} = ui;
  const { context: authContext, send: authSend } = auth;
  const authResponse = authContext.authResponse;

  const formContext = uiContext.toggleStates || {};
  const showPassword = formContext["showPassword"] ?? false;
  
  const isSuccess = authResponse && 'accessToken' in authResponse && authResponse.accessToken;

  const isMobile = useMediaQuery(useTheme().breakpoints.down("sm"));

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    authSend({ type: "SUBMIT" });
  };

  return (
      <Box className="login-container">
        <Paper
          elevation={12}
          className={`login-paper ${isMobile ? 'login-paper--mobile' : ''}`}
        >
          {!isMobile && (
            <Box className="login-left-section">
              <Box className="login-logo-container">
                <Avatar
                  src={Logo}
                  alt="MediBook Logo"
                  className="login-logo"
                />
              </Box>
              <Typography variant="h3" className="login-title">
                MediBook
              </Typography>
              <Typography variant="h6" color="text.secondary" className="login-subtitle">
                Sistema de Gestión de Turnos Médicos
              </Typography>
              <Typography variant="body1" color="text.secondary" className="login-description">
                Inicia sesión para acceder a tu cuenta y gestionar tus citas médicas de manera eficiente.
              </Typography>
              
              <Box className="login-cards-container">
                <Card className="login-role-card">
                  <LocalHospital className="login-role-icon login-role-icon--doctor" />
                  <Typography variant="caption" display="block" className="login-role-text--doctor">
                    Para Médicos
                  </Typography>
                </Card>
                <Card className="login-role-card">
                  <Person className="login-role-icon login-role-icon--patient" />
                  <Typography variant="caption" display="block" className="login-role-text--patient">
                    Para Pacientes
                  </Typography>
                </Card>
              </Box>
            </Box>
          )}

          {!isMobile && <Divider orientation="vertical" flexItem className="login-divider" />}

        <Box className="login-right-section">
          {isMobile && (
            <Box className="login-mobile-header">
              <Avatar
                src={Logo}
                alt="MediBook Logo"
                className="login-mobile-logo"
              />
              <Typography variant="h4" className="login-mobile-title">
                MediBook
              </Typography>
            </Box>
          )}
          
          {isSuccess ? (
            <Box className="login-success-container">
              <Typography variant="h4" className="login-success-emoji">🎉</Typography>
              <Typography variant="h5" color="success.main" className="login-success-title">
                ¡Bienvenido de vuelta!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Inicio de sesión exitoso
              </Typography>
            </Box>
          ) : (
            <Card elevation={0} sx={{ backgroundColor: 'transparent' }}>
              <CardContent sx={{ p: 0 }}>
                <Typography
                  variant="h4"
                  className="login-form-title"
                >
                  Iniciar Sesión
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  className="login-form-subtitle"
                >
                  Accede a tu cuenta para gestionar turnos médicos
                </Typography>

                <Box component="form" onSubmit={handleSubmit}>
                  <Stack className="login-form-stack">
                  <TextField
                    label="Correo Electrónico"
                    name="email"
                    type="email"
                    fullWidth
                    required
                    value={authContext.formValues.email || ""}
                    onChange={(e) => authSend({ type: "UPDATE_FORM", key: "email", value: e.target.value })}
                    error={!!authContext.formErrors?.email}
                    helperText={authContext.formErrors?.email || ""}
                    className="login-email-field"
                  />

                  <FormControl variant="outlined" fullWidth required>
                    <InputLabel htmlFor="outlined-adornment-password">Contraseña</InputLabel>
                    <OutlinedInput
                      id="outlined-adornment-password"
                      type={showPassword ? 'text' : 'password'}
                      value={authContext.formValues.password || ""}
                      onChange={(e) => authSend({ type: "UPDATE_FORM", key: "password", value: e.target.value })}
                      error={!!authContext.formErrors?.password}
                      className="login-password-field"
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={showPassword ? 'ocultar contraseña' : 'mostrar contraseña'}
                            onClick={() => uiSend({ type: "TOGGLE", key: "showPassword"})}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                      label="Contraseña"
                    />
                    {authContext.formErrors?.password && (
                      <Typography variant="caption" color="error" className="login-password-error">
                        {authContext.formErrors.password}
                      </Typography>
                    )}
                  </FormControl>

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={authContext.hasErrorsOrEmpty || authContext.loading}
                    className="login-submit-button"
                  >
                    {authContext.loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                  </Button>

                  <Box className="login-register-container">
                    <Typography variant="body2" color="text.secondary">
                      ¿No tienes cuenta?{" "}
                      <Button
                        variant="text"
                        onClick={() => authSend({ type: "TOGGLE_MODE", mode: "register" })}
                        className="login-register-button"
                      >
                        Regístrate aquí
                      </Button>
                    </Typography>
                  </Box>

                  {authResponse && 'error' in authResponse && (
                    <Box className="login-error-box">
                      <Typography variant="body2" color="error" className="login-message-text">
                        {authResponse.error || authResponse.message || 'Error en el inicio de sesión'}
                      </Typography>
                    </Box>
                  )}

                  {authResponse && 'message' in authResponse && !('error' in authResponse) && (
                    <Box className="login-success-box">
                      <Typography variant="body2" color="success.main" className="login-message-text">
                        {authResponse.message}
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

export default LoginScreen;