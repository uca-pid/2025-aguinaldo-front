import { 
  Box, Button, Typography, CircularProgress,
  Container 
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useMachines } from "#/providers/MachineProvider";
import { useAuthMachine } from "#/providers/AuthProvider";
import { useParams } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";
import { DateCalendar } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import dayjs from "dayjs";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { SignInResponse } from "#/models/Auth";
import { TurnService } from "#/service/turn-service.service";
import "./ModifyTurn.css";

const ModifyTurn: React.FC = () => {
  const { turnId } = useParams<{ turnId: string }>();
  const { uiSend, turnState, turnSend } = useMachines();
  const { authState } = useAuthMachine();
  const user: SignInResponse = authState?.context?.authResponse || {};
  
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [currentTurn, setCurrentTurn] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  
  useEffect(() => {
    if (turnId && user.accessToken) {
      loadTurnData();
    }
  }, [turnId, user.accessToken]);
  
  const loadTurnData = async () => {
    try {
      setIsLoading(true);
      // Buscar el turno en el contexto actual
      const turn = turnState.context.myTurns.find((t: any) => t.id === turnId);
      if (turn) {
        setCurrentTurn(turn);
        // Cargar disponibilidad del doctor
        await loadDoctorAvailability(turn.doctorId);
      } else {
        // Si no está en el contexto, cargar los turnos
        turnSend({ type: "DATA_LOADED" });
      }
    } catch (error) {
      console.error('Error loading turn data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadDoctorAvailability = async (doctorId: string) => {
    try {
      if (!user.accessToken) return;
      
      const availability = await TurnService.getDoctorAvailability(doctorId, user.accessToken);
      
      if (availability && availability.availableDates) {
        setAvailableDates(availability.availableDates);
      }
    } catch (error) {
      console.error('Error loading doctor availability:', error);
    }
  };
  
  const loadAvailableSlots = async (date: Dayjs) => {
    if (!currentTurn || !user.accessToken) return;
    
    try {
      const dateString = date.format('YYYY-MM-DD');
      const slots = await TurnService.getAvailableTurns(currentTurn.doctorId, dateString, user.accessToken);
      setAvailableSlots(slots || []);
    } catch (error) {
      console.error('Error loading available slots:', error);
      setAvailableSlots([]);
    }
  };

  const handleDateChange = (newValue: Dayjs | null) => {
    setSelectedDate(newValue);
    setSelectedTime(null);
    if (newValue) {
      loadAvailableSlots(newValue);
    } else {
      setAvailableSlots([]);
    }
  };

  const handleTimeSelect = (timeSlot: string) => {
    setSelectedTime(timeSlot);
  };

  const handleSubmitModification = async () => {
    if (!selectedTime || !currentTurn || !user.accessToken) return;
    
    try {
      setIsSubmitting(true);
      
      await TurnService.createModifyRequest({
        turnId: currentTurn.id,
        newScheduledAt: selectedTime
      }, user.accessToken);
      
      // Mostrar mensaje de éxito y volver
      alert('Solicitud de modificación enviada exitosamente. El doctor deberá aprobar el cambio.');
      handleClose();
      
    } catch (error: any) {
      console.error('Error submitting modification:', error);
      alert(error.message || 'Error al enviar la solicitud de modificación');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    uiSend({ type: "NAVIGATE", to: "/patient/view-turns" });
  };

  if (isLoading) {
    return (
      <Box className="modify-turn-container">
        <Container maxWidth="lg" className="modify-turn-loading">
          <CircularProgress />
          <Typography>Cargando información del turno...</Typography>
        </Container>
      </Box>
    );
  }

  if (!currentTurn) {
    return (
      <Box className="modify-turn-container">
        <Container maxWidth="lg" className="modify-turn-error">
          <Typography variant="h6" color="error">
            Turno no encontrado
          </Typography>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleClose}
            variant="outlined"
            sx={{ mt: 2 }}
          >
            Volver a Mis Turnos
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box className="modify-turn-container">
      <Container maxWidth="lg" className="modify-turn-page-container">
        {/* Page Header */}
        <Box className="modify-turn-page-header">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleClose}
            className="modify-turn-back-button"
            variant="outlined"
          >
            Volver a Mis Turnos
          </Button>
          
          <Box className="modify-turn-title-section">
            <Typography variant="h3" className="modify-turn-page-title">
              Modificar Turno Médico
            </Typography>
            <Typography variant="h6" className="modify-turn-page-subtitle">
              Selecciona una nueva fecha y horario para tu cita
            </Typography>
          </Box>
        </Box>

        {/* Current Turn Info */}
        <Box className="modify-turn-current-info">
          <Typography variant="h6" sx={{ mb: 2 }}>
            Información del turno actual:
          </Typography>
          <Box sx={{ 
            p: 2, 
            backgroundColor: '#f5f5f5', 
            borderRadius: 2,
            mb: 3 
          }}>
            <Typography>
              <strong>Doctor:</strong> Dr. {currentTurn.doctorName}
            </Typography>
            <Typography>
              <strong>Especialidad:</strong> {currentTurn.doctorSpecialty}
            </Typography>
            <Typography>
              <strong>Fecha y hora actual:</strong> {dayjs(currentTurn.scheduledAt).format('DD/MM/YYYY HH:mm')}
            </Typography>
          </Box>
        </Box>

        {/* Date and Time Selection */}
        <Box className="modify-turn-selection-container">
          <Box className="modify-turn-calendar-section">
            <Box className="modify-turn-calendar-container">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={['DateCalendar']}>
                  <DemoItem>
                    <DateCalendar
                      value={selectedDate}
                      onChange={handleDateChange}
                      minDate={dayjs()}
                      shouldDisableDate={(date) => {
                        const dateString = date.format('YYYY-MM-DD');
                        return !availableDates.includes(dateString);
                      }}
                    />
                  </DemoItem>
                </DemoContainer>
              </LocalizationProvider>
            </Box>
            <Typography variant="body2" color="text.secondary" textAlign="center" mt={2}>
              👨‍⚕️ Dr. {currentTurn.doctorName}
            </Typography>
          </Box>

          <Box className="modify-turn-time-section">
            {!selectedDate ? (
              <Box className="modify-turn-empty-state">
                <Typography>
                  📅 Primero selecciona una fecha
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.7 }}>
                  Elige una fecha en el calendario para ver los horarios disponibles
                </Typography>
              </Box>
            ) : availableSlots.length > 0 ? (
              <Box className="modify-turn-time-slots">
                <Typography variant="body2" sx={{ mb: 2, textAlign: 'center', color: '#1e3a8a', fontWeight: 600 }}>
                  {selectedDate.format("DD/MM/YYYY")}
                </Typography>
                <Box className="modify-turn-time-grid">
                  {availableSlots
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
                        className={`modify-turn-time-slot-button ${selectedTime === timeSlot ? 'selected' : ''}`}
                        onClick={() => handleTimeSelect(timeSlot)}
                        variant={selectedTime === timeSlot ? 'contained' : 'outlined'}
                      >
                        <Typography variant="body1" component="span" sx={{ fontWeight: 600 }}>
                          {dayjs(timeSlot).format('HH:mm')}
                        </Typography>
                      </Button>
                    ))}
                </Box>
              </Box>
            ) : (
              <Box className="modify-turn-empty-state">
                <Typography>
                  😔 No hay horarios disponibles
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.7 }}>
                  {selectedDate.format("DD/MM/YYYY")}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.7 }}>
                  El doctor no tiene horarios disponibles para esta fecha
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
        
        {/* Action Buttons */}
        <Box className="modify-turn-actions">
          <Button 
            onClick={handleClose} 
            className="modify-turn-btn-secondary"
            variant="outlined"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmitModification}
            variant="contained"
            className="modify-turn-btn-primary"
            disabled={!selectedTime || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Enviando solicitud...
              </>
            ) : (
              '✓ Solicitar Modificación'
            )}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default ModifyTurn;