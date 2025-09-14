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

function LoginScreen() {
  const { auth } = useAuthMachine();
  const { ui } = useMachines();
  const { context: uiContext, send: uiSend} = ui;
  const { context: authContext, send: authSend } = auth;

  const formContext = uiContext.toggleStates || {};
  const isIn = formContext["fade"] ?? true;
  const showPassword = formContext["showPassword"] ?? false;
  const isSuccess =
    (authContext.apiResponse && !authContext.apiResponse.error) ?? false;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    authSend({ type: "SUBMIT" });
  };

  return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{
          background: 'linear-gradient(135deg, #1f4f6f 0%, #22577a 50%, #2d7d90 100%)',
          p: { xs: 1, sm: 2 }
        }}
      >
        <Paper
          elevation={12}
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: "center",
            justifyContent: "center",
            gap: isMobile ? 2 : 4,
            p: { xs: 2, sm: 4 },
            width: "100%",
            maxWidth: { xs: "100%", sm: 800, md: 1000 },
            borderRadius: 4,
            opacity: isIn ? 1 : 0,
            transition: "all 0.3s ease-in-out",
            background: 'white',
            boxShadow: '0 20px 40px rgba(31, 79, 111, 0.15)',
            mx: { xs: 1, sm: 2 },
          }}
        >
          {!isMobile && (
            <Box flex={1} textAlign="center" sx={{ pr: { xs: 0, sm: 2 } }}>
              <Box display="flex" justifyContent="center" mb={3}>
                <Avatar
                  src={Logo}
                  alt="MediBook Logo"
                  sx={{ 
                    width: { xs: 80, sm: 100, md: 120 }, 
                    height: { xs: 80, sm: 100, md: 120 },
                    boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                    border: '4px solid #fff'
                  }}
                />
              </Box>
              <Typography variant="h3" fontWeight={800} mb={2} sx={{ 
                fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
                color: '#0d2230',
              }}>
                MediBook
              </Typography>
              <Typography variant="h6" color="text.secondary" mb={3} sx={{ 
                fontWeight: 500,
                fontSize: { xs: '1rem', sm: '1.2rem' }
              }}>
                Sistema de Gestión de Turnos Médicos
              </Typography>
              <Typography variant="body1" color="text.secondary" px={2} sx={{ 
                lineHeight: 1.6,
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }}>
                Inicia sesión para acceder a tu cuenta y gestionar tus citas médicas de manera eficiente.
              </Typography>
              
              <Box display="flex" justifyContent="center" gap={2} mt={4}>
                <Card sx={{ p: 2, textAlign: 'center', minWidth: 120, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <LocalHospital sx={{ fontSize: 32, color: '#22577a', mb: 1 }} />
                  <Typography variant="caption" display="block" fontWeight={600} color="#22577a">
                    Para Médicos
                  </Typography>
                </Card>
                <Card sx={{ p: 2, textAlign: 'center', minWidth: 120, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <Person sx={{ fontSize: 32, color: '#2d7d90', mb: 1 }} />
                  <Typography variant="caption" display="block" fontWeight={600} color="#2d7d90">
                    Para Pacientes
                  </Typography>
                </Card>
              </Box>
            </Box>
          )}

          {!isMobile && <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />}

        <Box flex={1} width="100%">
          {isMobile && (
            <Box textAlign="center" mb={4}>
              <Avatar
                src={Logo}
                alt="MediBook Logo"
                sx={{ 
                  width: { xs: 70, sm: 80 }, 
                  height: { xs: 70, sm: 80 },
                  mx: 'auto',
                  mb: 2,
                  boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                }}
              />
              <Typography variant="h4" fontWeight={700} sx={{ 
                fontSize: { xs: '1.5rem', sm: '2rem' },
                color: '#0d2230',
              }}>
                MediBook
              </Typography>
            </Box>
          )}
          
          {isSuccess ? (
            <Box textAlign="center" p={4}>
              <Typography variant="h4" mb={2}>🎉</Typography>
              <Typography variant="h5" fontWeight={600} color="success.main" mb={2}>
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
                  mb={1}
                  fontWeight={700}
                  textAlign="center"
                  sx={{ color: '#2d3748' }}
                >
                  Iniciar Sesión
                </Typography>
                <Typography
                  variant="body2"
                  textAlign="center"
                  color="text.secondary"
                  mb={4}
                >
                  Accede a tu cuenta para gestionar turnos médicos
                </Typography>

                <Box component="form" onSubmit={handleSubmit}>
                  <Stack spacing={3}>
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
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: '#22577a',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#22577a',
                        },
                      },
                    }}
                  />

                  <FormControl variant="outlined" fullWidth required>
                    <InputLabel htmlFor="outlined-adornment-password">Contraseña</InputLabel>
                    <OutlinedInput
                      id="outlined-adornment-password"
                      type={showPassword ? 'text' : 'password'}
                      value={authContext.formValues.password || ""}
                      onChange={(e) => authSend({ type: "UPDATE_FORM", key: "password", value: e.target.value })}
                      error={!!authContext.formErrors?.password}
                      sx={{
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#22577a',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#22577a',
                        },
                      }}
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
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                        {authContext.formErrors.password}
                      </Typography>
                    )}
                  </FormControl>

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={authContext.apiResponse?.loading || authContext.hasErrorsOrEmpty}
                    sx={{ 
                      mt: 4, 
                      py: 1.8,
                      borderRadius: 2,
                      background: '#22577a',
                      boxShadow: '0 4px 15px rgba(34, 87, 122, 0.3)',
                      '&:hover': {
                        background: '#1f4f6f',
                        boxShadow: '0 6px 20px rgba(34, 87, 122, 0.4)',
                      },
                      '&:disabled': {
                        background: '#e2e8f0',
                        boxShadow: 'none',
                      }
                    }}
                  >
                    {authContext.apiResponse?.loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                  </Button>

                  <Box textAlign="center" mt={3}>
                    <Typography variant="body2" color="text.secondary">
                      ¿No tienes cuenta?{" "}
                      <Button
                        variant="text"
                        onClick={() => authSend({ type: "TOGGLE_MODE", mode: "register" })}
                        sx={{ 
                          textTransform: "none", 
                          p: 0, 
                          minWidth: "auto",
                          color: '#22577a',
                          fontWeight: 600,
                          '&:hover': {
                            backgroundColor: 'transparent',
                            color: '#1f4f6f',
                          }
                        }}
                      >
                        Regístrate aquí
                      </Button>
                    </Typography>
                  </Box>

                  {authContext.apiResponse?.error && (
                    <Box 
                      sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        backgroundColor: '#fee2e2', 
                        border: '1px solid #fecaca',
                        mt: 2 
                      }}
                    >
                      <Typography variant="body2" color="error" textAlign="center">
                        {authContext.apiResponse.error}
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