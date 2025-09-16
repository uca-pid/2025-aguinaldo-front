import { 
  Box, Button, FormControl, FormHelperText, InputLabel, MenuItem, Select, SelectChangeEvent, 
  TextField, Typography, CircularProgress, Alert,
  Avatar, Container 
} from "@mui/material";
import React, { useEffect } from "react";
import { useMachines } from "#/providers/MachineProvider";
import { useAuthMachine } from "#/providers/AuthProvider";
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";
import { DateCalendar } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { SignInResponse } from "#/models/Auth";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import "./ReservationTurns.css";

const ReservationTurns: React.FC = () => {
  const { ui, turn } = useMachines();
  const { auth } = useAuthMachine();
  const { send: uiSend } = ui;
  const { context: authContext, authResponse: authResponse } = auth;
  const user = authResponse as SignInResponse
  const { state: turnState, send: turnSend } = turn;
  
  const turnContext = turnState.context;
  const formValues = turnContext.takeTurn;

  const currentStep = turnState.value.takeTurn;

  useEffect(() => {
    if (authContext.isAuthenticated && user.accessToken) {
      turnSend({
        type: "SET_AUTH",
        accessToken: user.accessToken,
        userId: user.id || ""
      });
      turnSend({ type: "LOAD_DOCTORS" });
    }
  }, [authContext.isAuthenticated, user.accessToken, turnSend]);

  useEffect(() => {
    if (formValues.doctorId && formValues.dateSelected && user.accessToken) {
      const dateString = formValues.dateSelected.format('YYYY-MM-DD');
      turnSend({
        type: "LOAD_AVAILABLE_TURNS",
        doctorId: formValues.doctorId,
        date: dateString
      });
    }
  }, [formValues.doctorId, formValues.dateSelected, user.accessToken, turnSend]);

  const isProfessionSelected = !!formValues.professionSelected;
  const isDoctorSelected = !!formValues.doctorId;

  const specialties = Array.from(new Set(turnContext.doctors.map((doctor: any) => doctor.specialty))).map((specialty: unknown) => ({
    value: specialty as string,
    label: (specialty as string).charAt(0).toUpperCase() + (specialty as string).slice(1)
  }));

  const filteredDoctors = isProfessionSelected
    ? turnContext.doctors.filter((doctor: any) => doctor.specialty.toLowerCase() === formValues.professionSelected.toLowerCase())
    : [];

  const handleClose = () => {
    uiSend({ type: "NAVIGATE", to: "/patient" });
    turnSend({ type: "RESET_TAKE_TURN" });
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    turnSend({ type: "UPDATE_FORM_TAKE_TURN", key: "reason", value: e.target.value });
  };    

  const handleProfessionChange = (event: SelectChangeEvent) => {
    turnSend({ type: "UPDATE_FORM_TAKE_TURN", key: "professionSelected", value: event.target.value });
    turnSend({ type: "UPDATE_FORM_TAKE_TURN", key: "doctorId", value: "" });
    turnSend({ type: "UPDATE_FORM_TAKE_TURN", key: "profesionalSelected", value: "" });
  };
  
  const handleDoctorChange = (event: SelectChangeEvent) => {
    const selectedDoctor = turnContext.doctors.find((doctor: any) => doctor.id === event.target.value);
    turnSend({ type: "UPDATE_FORM_TAKE_TURN", key: "doctorId", value: event.target.value });
    turnSend({ type: "UPDATE_FORM_TAKE_TURN", key: "profesionalSelected", value: selectedDoctor ? `${selectedDoctor.name} ${selectedDoctor.surname}` : "" });
  };

  const handleDateChange = (newValue: Dayjs | null) => {
    turnSend({ type: "UPDATE_FORM_TAKE_TURN", key: "dateSelected", value: newValue });
    turnSend({ type: "UPDATE_FORM_TAKE_TURN", key: "timeSelected", value: null });
    turnSend({ type: "UPDATE_FORM_TAKE_TURN", key: "scheduledAt", value: null });
  };

  const handleTimeSelect = (timeSlot: string) => {
    const selectedDateTime = dayjs(timeSlot);
    turnSend({ type: "UPDATE_FORM_TAKE_TURN", key: "timeSelected", value: selectedDateTime });
    turnSend({ type: "UPDATE_FORM_TAKE_TURN", key: "scheduledAt", value: timeSlot });
  };

  const handleReserve = async () => {
    if (!formValues.scheduledAt) return;
    try {
      turnSend({ type: "CREATE_TURN" });
      
      setTimeout(() => {
        if (!turnContext.error) {
          uiSend({ type: "NAVIGATE", to: "/patient" });
          turnSend({ type: "RESET_TAKE_TURN" });
          turnSend({ type: "LOAD_MY_TURNS" });
        }
      }, 1000);
    } catch (error) {
      console.error('Error creating turn:', error);
    }
  };

  const handleNext = () => {
    turnSend({ type: "UPDATE_FORM_TAKE_TURN", key: "dateSelected", value: null });
    turnSend({ type: "UPDATE_FORM_TAKE_TURN", key: "scheduledAt", value: null });
    
    turnSend({ type: "NEXT" });
  };

  return(
    <Container maxWidth="lg" className="reservation-container">
      <Box className="reservation-page-container">
        <Box className="reservation-header">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleClose}
            className="reservation-back-button"
            variant="outlined"
          >
            Volver al Dashboard
          </Button>
          <Avatar className="reservation-header-icon">
            <CalendarTodayIcon sx={{ fontSize: 32, color: 'white' }} />
          </Avatar>
          <Box className="reservation-header-content">
            <Typography variant="h4" className="reservation-header-title">
              Reservar Turno
            </Typography>
            <Typography variant="body1" className="reservation-header-subtitle">
              Agenda tu cita médica en simples pasos
            </Typography>
          </Box>
        </Box>

          {turnContext.doctorsError && (
            <Alert severity="error" className="reservation-alert">
              Error al cargar doctores: {turnContext.doctorsError}
            </Alert>
          )}
          
          {turnContext.availableError && (
            <Alert severity="error" className="reservation-alert">
              Error al cargar turnos disponibles: {turnContext.availableError}
            </Alert>
          )}
          
          {turnContext.error && (
            <Alert severity="error" className="reservation-alert">
              Error al crear turno: {turnContext.error}
            </Alert>
          )}

          {currentStep === "step1" && (
            <Box className="reservation-step1-container">
              <Box className="reservation-progress-indicator">
                <Box className="reservation-progress-step active">
                  1. Información de la consulta
                </Box>
                <Box className="reservation-progress-step inactive">
                  2. Selecciona fecha y horario
                </Box>
              </Box>

              <Box className="reservation-form-section">
                <TextField
                  label="Motivo de la consulta"
                  value={formValues.reason}
                  onChange={handleReasonChange}
                  fullWidth
                  size="small"
                  className="reservation-input"
                  multiline
                  rows={3}
                  placeholder="Describe brevemente el motivo de tu consulta..."
                />
                
                <FormControl required size="small" fullWidth className="reservation-select specialty-select">
                  <InputLabel id="profession-select-label">Especialidad</InputLabel>
                  <Select
                    labelId="profession-select-label"
                    id="profession-select"
                    value={formValues.professionSelected}
                    label="Especialidad *"
                    onChange={handleProfessionChange}
                    disabled={turnContext.isLoadingDoctors}
                  >
                    <MenuItem value="">
                      <em>Seleccione una especialidad</em>
                    </MenuItem>
                    {specialties.map((specialty) => (
                      <MenuItem key={specialty.value} value={specialty.value}>
                        {specialty.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {turnContext.isLoadingDoctors && <FormHelperText>Cargando especialidades...</FormHelperText>}
                </FormControl>
                
                <FormControl required size="small" fullWidth className="reservation-select doctor-select">
                  <InputLabel id="doctor-select-label">Doctor</InputLabel>
                  <Select
                    labelId="doctor-select-label"
                    id="doctor-select"
                    value={formValues.doctorId}
                    label="Doctor *"
                    onChange={handleDoctorChange}
                    disabled={!isProfessionSelected || turnContext.isLoadingDoctors}
                  >
                    <MenuItem value="">
                      <em>Seleccione un doctor</em>
                    </MenuItem>
                    {filteredDoctors.map((doctor: any) => (
                      <MenuItem key={doctor.id} value={doctor.id}>
                        {doctor.name} {doctor.surname} - {doctor.medicalLicense}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    {!isProfessionSelected 
                      ? "Primero selecciona una especialidad" 
                      : "Requerido"
                    }
                  </FormHelperText>
                </FormControl>
              </Box>

              <Box className="reservation-actions">
                <Button 
                  onClick={handleClose} 
                  className="reservation-btn-secondary"
                  variant="outlined"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleNext}
                  variant="contained"
                  className="reservation-btn-primary"
                  disabled={
                    !isProfessionSelected ||
                    !isDoctorSelected
                  }
                >
                  Siguiente: Fecha y Horario →
                </Button>
              </Box>
            </Box>
          )}
          
          {currentStep === "step2" && (
            <Box className="reservation-step2-container">
              {/* Progress Indicator */}
              <Box className="reservation-progress-indicator">
                <Box className="reservation-progress-step completed">
                  ✓ 1. Información completada
                </Box>
                <Box className="reservation-progress-step active">
                  2. Selecciona fecha y horario
                </Box>
              </Box>

              <Box className="reservation-step2-content">
                <Box className="reservation-calendar-section">
                  <Box className="reservation-calendar-container">
                    <DemoContainer components={['DateCalendar']}>
                      <DemoItem>
                        <DateCalendar
                          value={formValues.dateSelected}
                          onChange={handleDateChange}
                          minDate={dayjs()}
                        />
                      </DemoItem>
                    </DemoContainer>
                  </Box>
                  <Typography variant="body2" color="text.secondary" textAlign="center" mt={2}>
                    👨‍⚕️ Dr. {filteredDoctors.find((d: any) => d.id === formValues.doctorId)?.name} {filteredDoctors.find((d: any) => d.id === formValues.doctorId)?.surname}
                  </Typography>
                </Box>

                <Box className="reservation-time-section">
                  {!formValues.dateSelected ? (
                    <Box className="reservation-empty-state">
                      <Typography>
                        📅 Primero selecciona una fecha
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1, opacity: 0.7 }}>
                        Elige una fecha en el calendario para ver los horarios disponibles
                      </Typography>
                    </Box>
                  ) : turnContext.isLoadingAvailableTurns ? (
                    <Box className="reservation-loading-container">
                      <CircularProgress />
                      <Typography className="reservation-loading-text">
                        Cargando horarios disponibles...
                      </Typography>
                    </Box>
                  ) : turnContext.availableTurns.length > 0 ? (
                    <Box className="reservation-time-slots">
                      <Typography variant="body2" sx={{ mb: 2, textAlign: 'center', color: '#1e3a8a', fontWeight: 600 }}>
                        {formValues.dateSelected.format("DD/MM/YYYY")}
                      </Typography>
                      <Box className="reservation-time-grid">
                        {turnContext.availableTurns
                          .filter((timeSlot: string) => {
                            const slotDateTime = dayjs(timeSlot);
                            const now = dayjs();
                            
                            if (slotDateTime.isSame(now, 'day')) {
                              return slotDateTime.isAfter(now);
                            }
                            
                            return slotDateTime.isAfter(now, 'day');
                          })
                          .map((timeSlot: string, index: number) => (
                            <Button
                              key={index}
                              className={`reservation-time-slot-button ${formValues.scheduledAt === timeSlot ? 'selected' : ''}`}
                              onClick={() => handleTimeSelect(timeSlot)}
                              variant={formValues.scheduledAt === timeSlot ? 'contained' : 'outlined'}
                            >
                              <Typography variant="body1" component="span" sx={{ fontWeight: 600 }}>
                                {dayjs(timeSlot).format('HH:mm')}
                              </Typography>
                            </Button>
                          ))}
                      </Box>
                    </Box>
                  ) : (
                    <Box className="reservation-empty-state">
                      <Typography>
                        😔 No hay horarios disponibles
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1, opacity: 0.7 }}>
                        {formValues.dateSelected.format("DD/MM/YYYY")}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1, opacity: 0.7 }}>
                        Intenta seleccionar otra fecha
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
              
              <Box className="reservation-actions">
                <Button 
                  onClick={() => turnSend({ type: "BACK" })} 
                  className="reservation-btn-secondary"
                  variant="outlined"
                >
                  ← Atrás
                </Button>
                <Button
                  onClick={handleReserve}
                  variant="contained"
                  className="reservation-btn-primary"
                  disabled={!formValues.scheduledAt || turnContext.isCreatingTurn}
                >
                  {turnContext.isCreatingTurn ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Confirmando reserva...
                    </>
                  ) : (
                    '✓ Confirmar Reserva'
                  )}
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Container>
  );
}

export default ReservationTurns;