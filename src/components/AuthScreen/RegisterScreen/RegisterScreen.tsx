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
  Avatar,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalHospital, Person } from "@mui/icons-material";
import { useMachines } from "../../../providers/MachineProvider";
import { useAuthMachine } from "../../../providers/AuthProvider";
import Logo from "../../../assets/MediBook-Logo.png";
import dayjs from 'dayjs';
import 'dayjs/locale/es';

// Set Spanish locale for dayjs
dayjs.locale('es');

function RegisterScreen() {
  const { auth } = useAuthMachine();
  const { ui } = useMachines();
  const { context: uiContext } = ui;
  const { context: authContext, send: authSend } = auth;

  const formContext = uiContext.toggleStates || {};
  const isPatient = authContext.isPatient;
  const isIn = formContext["fade"] ?? true;
  const isSuccess =
    (authContext.apiResponse && !authContext.apiResponse.error) ?? false;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
          maxWidth: { xs: "100%", sm: 900, md: 1100 },
          borderRadius: 4,
          opacity: isIn ? 1 : 0,
          transition: "all 0.3s ease-in-out",
          background: 'white',
          boxShadow: '0 20px 40px rgba(13, 34, 48, 0.15)',
          mx: { xs: 1, sm: 2 },
        }}
      >
        {!isMobile && (
          <Box flex={1} textAlign="center" sx={{ pr: 2 }}>
            <Box display="flex" justifyContent="center" mb={3}>
              <Avatar
                src={Logo}
                alt="MediBook Logo"
                sx={{ 
                  width: 120, 
                  height: 120,
                  boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                  border: '4px solid #fff'
                }}
              />
            </Box>
            <Typography variant="h3" fontWeight={800} mb={2} sx={{ 
              color: '#0d2230',
            }}>
              MediBook
            </Typography>
            <Typography variant="h6" color="text.secondary" mb={3} sx={{ fontWeight: 500 }}>
              Sistema de Gestión de Turnos Médicos
            </Typography>
            <Typography variant="body1" color="text.secondary" px={2} sx={{ lineHeight: 1.6, mb: 4 }}>
              Únete a nuestra plataforma para gestionar turnos médicos de manera eficiente.
            </Typography>
            
            <Stack spacing={2}>
              <Card sx={{ p: 3, backgroundColor: '#f8fafc', border: '2px solid #e2e8f0' }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Person sx={{ fontSize: 32, color: '#22577a' }} />
                  <Typography variant="h6" fontWeight={600}>Para Pacientes</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Reserva y gestiona tus citas médicas fácilmente
                </Typography>
              </Card>
              
              <Card sx={{ p: 3, backgroundColor: '#f8fafc', border: '2px solid #e2e8f0' }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <LocalHospital sx={{ fontSize: 32, color: '#38a3a5' }} />
                  <Typography variant="h6" fontWeight={600}>Para Médicos</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Administra tu agenda y atiende a tus pacientes
                </Typography>
              </Card>
            </Stack>
          </Box>
        )}

        {!isMobile && <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />}

        <Box flex={1.2} width="100%">
          {isMobile && (
            <Box textAlign="center" mb={4}>
              <Avatar
                src={Logo}
                alt="MediBook Logo"
                sx={{ 
                  width: 80, 
                  height: 80,
                  mx: 'auto',
                  mb: 2,
                  boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                }}
              />
              <Typography variant="h4" fontWeight={700} sx={{ 
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
                ¡Registro exitoso!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Tu cuenta ha sido creada correctamente
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
                  Crear Cuenta
                </Typography>
                <Typography
                  variant="body2"
                  textAlign="center"
                  color="text.secondary"
                  mb={4}
                >
                  Únete a MediBook para gestionar turnos médicos
                </Typography>

                <Stack
                  direction={isMobile ? "column" : "row"}
                  spacing={2}
                  justifyContent="center"
                  mb={4}
                >
                  <Chip
                    icon={<Person />}
                    label="Paciente"
                    variant={isPatient ? "filled" : "outlined"}
                    onClick={() => authSend({ type: "TOGGLE_USER_TYPE", isPatient: true})}
                    sx={{
                      py: 2,
                      px: 3,
                      fontSize: '1rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      ...(isPatient && {
                        background: '#22577a',
                        color: 'white',
                        boxShadow: '0 4px 15px rgba(34, 87, 122, 0.3)',
                        '&:hover': {
                          background: '#1f4f6f',
                          boxShadow: '0 6px 20px rgba(34, 87, 122, 0.4)',
                        }
                      })
                    }}
                  />
                  <Chip
                    icon={<LocalHospital />}
                    label="Médico"
                    variant={!isPatient ? "filled" : "outlined"}
                    onClick={() => authSend({ type: "TOGGLE_USER_TYPE", isPatient: false})}
                    sx={{
                      py: 2,
                      px: 3,
                      fontSize: '1rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      ...(!isPatient && {
                        background: '#2d7d90',
                        color: 'white',
                        boxShadow: '0 4px 15px rgba(45, 125, 144, 0.3)',
                        '&:hover': {
                          background: '#22577a',
                          boxShadow: '0 6px 20px rgba(45, 125, 144, 0.4)',
                        }
                      })
                    }}
                  />
                </Stack>

                <Box component="form" onSubmit={handleSubmit}>
                  <Stack spacing={3}>
                  <Stack direction={isMobile ? "column" : "row"} spacing={2}>
                    <TextField
                      label="Nombre"
                      name="name"
                      fullWidth
                      required
                      value={authContext.formValues.name || ""}
                      onChange={(e) => authSend({ type: "UPDATE_FORM", key: "name", value: e.target.value })}
                      error={!!authContext.formErrors?.name}
                      helperText={authContext.formErrors?.name || ""}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': { borderColor: '#22577a' },
                          '&.Mui-focused fieldset': { borderColor: '#22577a' },
                        },
                      }}
                    />
                    <TextField
                      label="Apellido"
                      name="surname"
                      fullWidth
                      required
                      value={authContext.formValues.surname || ""}
                      onChange={(e) => authSend({ type: "UPDATE_FORM", key: "surname", value: e.target.value })}
                      error={!!authContext.formErrors?.surname}
                      helperText={authContext.formErrors?.surname || ""}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': { borderColor: '#22577a' },
                          '&.Mui-focused fieldset': { borderColor: '#22577a' },
                        },
                      }}
                    />
                  </Stack>

                  <Stack direction={isMobile ? "column" : "row"} spacing={2}>
                    <TextField
                      label="DNI"
                      name="dni"
                      type="number"
                      fullWidth
                      required
                      value={authContext.formValues.dni || ""}
                      onChange={(e) => authSend({ type: "UPDATE_FORM", key: "dni", value: e.target.value })}
                      error={!!authContext.formErrors?.dni}
                      helperText={authContext.formErrors?.dni || ""}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': { borderColor: '#22577a' },
                          '&.Mui-focused fieldset': { borderColor: '#22577a' },
                        },
                      }}
                    />
                    <FormControl
                      fullWidth
                      required
                      error={!!authContext.formErrors?.gender}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#22577a' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#22577a' },
                        },
                      }}
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
                        <MenuItem value={"Masculino"}>Masculino</MenuItem>
                        <MenuItem value={"Femenino"}>Femenino</MenuItem>
                      </Select>
                      <FormHelperText>
                        {authContext.formErrors?.gender}
                      </FormHelperText>
                    </FormControl>
                  </Stack>

                  <Stack direction={isMobile ? "column" : "row"} spacing={2}>
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
                              sx: {
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  '&:hover fieldset': { borderColor: '#22577a' },
                                  '&.Mui-focused fieldset': { borderColor: '#22577a' },
                                },
                              }
                            },
                          }}
                          onChange={(date) => authSend({ type: "UPDATE_FORM", key: "birthdate", value: date ? date.toISOString() : null })}
                        />
                      </LocalizationProvider>
                    </FormControl>
                    <TextField
                      label="Número de Teléfono"
                      name="phone"
                      type="tel"
                      fullWidth
                      required
                      value={authContext.formValues.phone || ""}
                      onChange={(e) => authSend({ type: "UPDATE_FORM", key: "phone", value: e.target.value })}
                      error={!!authContext.formErrors?.phone}
                      helperText={authContext.formErrors?.phone || ""}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': { borderColor: '#22577a' },
                          '&.Mui-focused fieldset': { borderColor: '#22577a' },
                        },
                      }}
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
                    helperText={authContext.formErrors?.email || ""}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': { borderColor: '#22577a' },
                        '&.Mui-focused fieldset': { borderColor: '#22577a' },
                      },
                    }}
                  />

                  <Stack direction={isMobile ? "column" : "row"} spacing={2}>
                    <TextField
                      label="Contraseña"
                      name="password"
                      type="password"
                      fullWidth
                      required
                      value={authContext.formValues.password || ""}
                      onChange={(e) => authSend({ type: "UPDATE_FORM", key: "password", value: e.target.value })}
                      error={!!authContext.formErrors?.password}
                      helperText={authContext.formErrors?.password || ""}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': { borderColor: '#22577a' },
                          '&.Mui-focused fieldset': { borderColor: '#22577a' },
                        },
                      }}
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
                      helperText={authContext.formErrors?.password_confirm || ""}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': { borderColor: '#22577a' },
                          '&.Mui-focused fieldset': { borderColor: '#22577a' },
                        },
                      }}
                    />
                  </Stack>

                  {/* Doctor-specific fields */}
                  {!isPatient && (
                    <Box sx={{ 
                      p: 3, 
                      borderRadius: 2, 
                      backgroundColor: '#f0f9ff', 
                      border: '2px solid #dbeafe',
                      mt: 2 
                    }}>
                      <Typography variant="h6" fontWeight={600} mb={3} sx={{ color: '#22577a' }}>
                        Información Profesional
                      </Typography>
                      <Stack spacing={3}>
                        <Stack direction={isMobile ? "column" : "row"} spacing={2}>
                          <TextField
                            label="Especialidad"
                            name="specialty"
                            fullWidth
                            required
                            value={authContext.formValues.specialty || ""}
                            onChange={(e) => authSend({ type: "UPDATE_FORM", key: "specialty", value: e.target.value })}
                            error={!!authContext.formErrors?.specialty}
                            helperText={authContext.formErrors?.specialty || ""}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover fieldset': { borderColor: '#22577a' },
                                '&.Mui-focused fieldset': { borderColor: '#22577a' },
                              },
                            }}
                          />
                          <TextField
                            label="Matrícula Médica"
                            name="medicalLicense"
                            fullWidth
                            required
                            value={authContext.formValues.medicalLicense || ""}
                            onChange={(e) => authSend({ type: "UPDATE_FORM", key: "medicalLicense", value: e.target.value })}
                            error={!!authContext.formErrors?.medicalLicense}
                            helperText={authContext.formErrors?.medicalLicense || ""}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover fieldset': { borderColor: '#22577a' },
                                '&.Mui-focused fieldset': { borderColor: '#22577a' },
                              },
                            }}
                          />
                        </Stack>
                        <TextField
                          label="Duración de turno (minutos)"
                          name="slotDurationMin"
                          type="number"
                          fullWidth
                          value={authContext.formValues.slotDurationMin || ""}
                          onChange={(e) => authSend({ type: "UPDATE_FORM", key: "slotDurationMin", value: parseInt(e.target.value) })}
                          error={!!authContext.formErrors?.slotDurationMin}
                          helperText={authContext.formErrors?.slotDurationMin || ""}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': { borderColor: '#22577a' },
                              '&.Mui-focused fieldset': { borderColor: '#22577a' },
                            },
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
                    disabled={authContext.apiResponse?.loading || authContext.hasErrorsOrEmpty}
                    sx={{ 
                      mt: 4, 
                      py: 2,
                      borderRadius: 2,
                      background: '#22577a',
                      boxShadow: '0 4px 15px rgba(34, 87, 122, 0.3)',
                      fontSize: '1.1rem',
                      fontWeight: 600,
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
                    {authContext.apiResponse?.loading ? "Creando cuenta..." : "Crear Cuenta"}
                  </Button>

                  <Box textAlign="center" mt={3}>
                    <Typography variant="body2" color="text.secondary">
                      ¿Ya tienes cuenta?{" "}
                      <Button
                        variant="text"
                        onClick={() => authSend({ type: "TOGGLE_MODE", mode: "login" })}
                        sx={{ 
                          textTransform: "none", 
                          p: 0, 
                          minWidth: "auto",
                          color: '#22577a',
                          fontWeight: 600,
                          '&:hover': {
                            backgroundColor: 'transparent',
                            color: '#5a6fd8',
                          }
                        }}
                      >
                        Inicia sesión aquí
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

export default RegisterScreen;
