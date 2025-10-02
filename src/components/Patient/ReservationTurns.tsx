import { 
  Box, Button, FormControl, FormHelperText, InputLabel, MenuItem, Select, SelectChangeEvent, 
  TextField, Typography, CircularProgress, Container, Avatar
} from "@mui/material";
import React from "react";
import { useMachines } from "#/providers/MachineProvider";
import { orchestrator } from "#/core/Orchestrator";
import { DATA_MACHINE_ID } from "#/machines/dataMachine";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";
import { DateCalendar } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import dayjs from "dayjs";
import Event from "@mui/icons-material/Event";
import "./ReservationTurns.css";

const ReservationTurns: React.FC = () => {
  const { uiSend, turnState, turnSend } = useMachines();  
  const turnContext = turnState.context;
  const formValues = turnContext.takeTurn;

  const currentStep = turnState.value.takeTurn;

  const isProfessionSelected = !!formValues.professionSelected;
  const isDoctorSelected = !!formValues.doctorId;

  const filteredDoctors = isProfessionSelected
    ? turnContext.doctors.filter((doctor: any) => doctor.specialty.toLowerCase() === formValues.professionSelected.toLowerCase())
    : [];

  const handleReasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    turnSend({ type: "UPDATE_FORM", path: ["takeTurn", "reason"], value: e.target.value });
  };    

  const handleProfessionChange = (event: SelectChangeEvent) => {
    turnSend({ type: "UPDATE_FORM", path: ["takeTurn", "professionSelected"], value: event.target.value });
    turnSend({ type: "UPDATE_FORM", path: ["takeTurn", "doctorId"], value: "" });
    turnSend({ type: "UPDATE_FORM", path: ["takeTurn", "profesionalSelected"], value: "" });
  };
  
  const handleDoctorChange = (event: SelectChangeEvent) => {
    const selectedDoctor = turnContext.doctors.find((doctor: any) => doctor.id === event.target.value);
    turnSend({ type: "UPDATE_FORM", path: ["takeTurn", "doctorId"], value: event.target.value });
    turnSend({ type: "UPDATE_FORM", path: ["takeTurn", "profesionalSelected"], value: selectedDoctor ? `${selectedDoctor.name} ${selectedDoctor.surname}` : "" });
    
    // Limpiar fecha y hora seleccionadas cuando cambia el doctor
    turnSend({ type: "UPDATE_FORM", path: ["takeTurn", "dateSelected"], value: null });
    turnSend({ type: "UPDATE_FORM", path: ["takeTurn", "timeSelected"], value: null });
    turnSend({ type: "UPDATE_FORM", path: ["takeTurn", "scheduledAt"], value: null });
    
    // Cargar fechas disponibles para el doctor seleccionado
    if (event.target.value) {
      orchestrator.sendToMachine(DATA_MACHINE_ID, { 
        type: "LOAD_AVAILABLE_DATES", 
        doctorId: event.target.value 
      });
    }
  };

  const handleDateChange = (newValue: Dayjs | null) => {
    turnSend({ type: "UPDATE_FORM", path: ["takeTurn", "dateSelected"], value: newValue });
    turnSend({ type: "UPDATE_FORM", path: ["takeTurn", "timeSelected"], value: null });
    turnSend({ type: "UPDATE_FORM", path: ["takeTurn", "scheduledAt"], value: null });
    
    // Cargar turnos disponibles para el doctor seleccionado en la fecha seleccionada
    if (newValue && formValues.doctorId) {
      orchestrator.sendToMachine(DATA_MACHINE_ID, { 
        type: "LOAD_AVAILABLE_TURNS", 
        doctorId: formValues.doctorId, 
        date: newValue.format('YYYY-MM-DD') 
      });
    }
  };

  const handleTimeSelect = (timeSlot: string) => {
    const selectedDateTime = dayjs(timeSlot);
    turnSend({ type: "UPDATE_FORM", path: ["takeTurn", "timeSelected"], value: selectedDateTime });
    turnSend({ type: "UPDATE_FORM", path: ["takeTurn", "scheduledAt"], value: timeSlot });
  };

  const handleReserve = async () => {
    if (!formValues.scheduledAt) return;
    try {
      turnSend({ type: "CREATE_TURN" });
      
      setTimeout(() => {
        if (!turnContext.error) {
          uiSend({ type: "NAVIGATE", to: "/patient" });
          turnSend({ type: "RESET_TAKE_TURN" });
        }
      }, 500);
    } catch (error) {
      console.error('Error creating turn:', error);
    }
  };

  const handleNext = () => {
    turnSend({ type: "UPDATE_FORM", path: ["takeTurn", "dateSelected"], value: null });
    turnSend({ type: "UPDATE_FORM", path: ["takeTurn", "scheduledAt"], value: null });
    
    turnSend({ type: "NEXT" });
  };

  return(
    <Box className="shared-container">
      {/* Page Header */}
      <Box className="shared-header">
        <Box className="shared-header-layout">

          <Box className="shared-header-content">
            <Avatar className="shared-header-icon">
              <Event sx={{ fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" className="shared-header-title">
                Reservar Turno Médico
              </Typography>
              <Typography variant="h6" className="shared-header-subtitle">
                Agenda tu cita médica en simples pasos
              </Typography>
            </Box>
          </Box>

          <Box className="shared-header-spacer"></Box>
        </Box>
      </Box>

      <Container maxWidth="lg" className="reservation-page-container">

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
                    {turnContext.specialties.map((specialty: { value: string; label: string }) => (
                      <MenuItem key={specialty.value} value={specialty.value}>
                        {specialty.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {turnContext.isLoadingDoctors && <FormHelperText>Cargando especialidades...</FormHelperText>}
                </FormControl>

                <FormControl required size="small" fullWidth className="reservation-select">
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
                
              </Box>

              <Box className="reservation-actions">
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
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DemoContainer components={['DateCalendar']}>
                        <DemoItem>
                          <DateCalendar
                            value={formValues.dateSelected}
                            onChange={handleDateChange}
                            minDate={dayjs()}
                            shouldDisableDate={(date) => {
                              const dateString = date.format('YYYY-MM-DD');
                              const isDisabled = !turnContext.availableDates.includes(dateString);
                              return isDisabled;
                            }}
                          />
                        </DemoItem>
                      </DemoContainer>
                    </LocalizationProvider>
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
                  ) : turnContext.isLoadingAvailableDates ? (
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
                    <Box className="reservation-loading-container">
                      <CircularProgress />
                      <Typography className="reservation-loading-text">
                        Cargando horarios disponibles...
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
        </Container>
      </Box>
    );
  }

  export default ReservationTurns;