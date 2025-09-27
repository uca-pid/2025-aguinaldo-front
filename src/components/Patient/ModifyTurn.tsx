import { 
  Box, Button, Typography, CircularProgress,
  Container 
} from "@mui/material";
import React, { useEffect } from "react";
import { useMachines } from "#/providers/MachineProvider";
import { useAuthMachine } from "#/providers/AuthProvider";
import { useParams } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";
import { DateCalendar } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { SignInResponse } from "#/models/Auth";
import { 
  formatDateTime, 
  shouldDisableDate 
} from "#/utils/dateTimeUtils";
import TimeSlotSelector from "#/components/shared/TimeSlotSelector/TimeSlotSelector";
import "./ModifyTurn.css";

const ModifyTurn: React.FC = () => {
  const { turnId } = useParams<{ turnId: string }>();
  const { uiSend, modifyTurnState, modifyTurnSend } = useMachines();
  const { authState } = useAuthMachine();
  const user: SignInResponse = authState?.context?.authResponse || {};
  
  const { 
    currentTurn, 
    selectedDate, 
    selectedTime, 
    availableSlots, 
    availableDates,
    reason,
    isLoadingTurnDetails, 
    isLoadingAvailableSlots, 
    isModifyingTurn,
    modifyError 
  } = modifyTurnState.context;

  useEffect(() => {
    if (user.accessToken && user.id) {
      modifyTurnSend({ type: "DATA_LOADED" });
    }
  }, [user.accessToken, user.id, modifyTurnSend]);

  useEffect(() => {
    if (turnId && user.accessToken) {
      modifyTurnSend({ type: "RESET" });
      modifyTurnSend({ type: "LOAD_TURN_DETAILS", turnId });
    }
  }, [turnId, user.accessToken, user.id, modifyTurnSend]);

  useEffect(() => {
    if (currentTurn?.doctorId) {
      modifyTurnSend({ 
        type: "LOAD_DOCTOR_AVAILABILITY", 
        doctorId: currentTurn.doctorId,
        date: dayjs().format('YYYY-MM-DD')
      });
    }
  }, [currentTurn?.doctorId, modifyTurnSend]);



  if (isLoadingTurnDetails) {
    return (
      <Container maxWidth="md" className="modify-turn-container">
        <Box className="modify-turn-loading">
          <CircularProgress size={40} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Cargando detalles del turno...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!currentTurn) {
    return (
      <Container maxWidth="md" className="modify-turn-container">
        <Box className="modify-turn-error">
          <Typography variant="h6" color="error">
            No se pudo cargar la información del turno
          </Typography>
          <Button 
            startIcon={<ArrowBackIcon />}
            onClick={() => uiSend({ type: "NAVIGATE", to: "/patient/view-turns" })}
            sx={{ mt: 2 }}
            variant="outlined"
          >
            Volver a mis turnos
          </Button>
        </Box>
      </Container>
    );

  }

  return (
    <Box className="reservation-container">
      <Container maxWidth="lg" className="reservation-page-container">
        <Box className="reservation-page-header">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => uiSend({ type: "NAVIGATE", to: "/patient/view-turns" })}
            className="reservation-back-button"
            variant="outlined"
          >
            Volver a Mis Turnos
          </Button>
          <Box className="reservation-title-section">
            <Typography variant="h3" className="reservation-page-title">
              Modificar Turno Médico
            </Typography>
            <Typography variant="h6" className="reservation-page-subtitle">
              Selecciona una nueva fecha y horario para tu cita
            </Typography>
          </Box>
        </Box>

        <Box className="reservation-step1-container">
          <Box className="reservation-form-section">
            <Typography variant="h6" className="reservation-section-title">
              📋 Información del Turno Actual
            </Typography>
            <Box className="reservation-info-card">
              <Typography variant="body1">
                <strong>Doctor:</strong> {currentTurn.doctorName}
              </Typography>
              <Typography variant="body1">
                <strong>Especialidad:</strong> {currentTurn.doctorSpecialty}
              </Typography>
              <Typography variant="body1">
                <strong>Fecha y Hora Actual:</strong> {formatDateTime(currentTurn.scheduledAt)}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box className="reservation-step2-container">
          <Box className="reservation-step2-content">
            <Box className="reservation-calendar-section">
              <Box className="reservation-calendar-container">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={['DateCalendar']}>
                    <DemoItem>
                      <DateCalendar
                        value={selectedDate}
                        onChange={newValue => {
                          modifyTurnSend({ type: "UPDATE_FORM", key: "selectedDate", value: newValue });
                          modifyTurnSend({ type: "UPDATE_FORM", key: "selectedTime", value: null });
                          if (newValue && currentTurn?.doctorId) {
                            modifyTurnSend({
                              type: "LOAD_AVAILABLE_SLOTS",
                              doctorId: currentTurn.doctorId,
                              date: newValue.format('YYYY-MM-DD')
                            });
                          }
                        }}
                        minDate={dayjs()}
                        shouldDisableDate={(date) => shouldDisableDate(date, availableDates)}
                      />
                    </DemoItem>
                  </DemoContainer>
                </LocalizationProvider>
              </Box>
              <Typography variant="body2" color="text.secondary" textAlign="center" mt={2}>
                👨‍⚕️ {currentTurn.doctorName}
              </Typography>
            </Box>
            <Box className="reservation-time-section">
              <Box className="reservation-time-slots">
                <TimeSlotSelector
                  selectedDate={selectedDate}
                  availableSlots={availableSlots}
                  selectedTime={selectedTime}
                  onTimeSelect={timeSlot => modifyTurnSend({ type: "UPDATE_FORM", key: "selectedTime", value: timeSlot })}
                  isLoadingSlots={isLoadingAvailableSlots}
                />
              </Box>
            </Box>
          </Box>
        </Box>
        
        {modifyError && (
          <Box className="reservation-error-message">
            <Typography color="error" variant="body2">
              {modifyError}
            </Typography>
          </Box>
        )}


        <Box className="reservation-actions">
          <Button 
            onClick={() => uiSend({ type: "NAVIGATE", to: "/patient/view-turns" })} 
            className="reservation-btn-secondary"
            variant="outlined"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => modifyTurnSend({ type: "SUBMIT_MODIFY_REQUEST" })}
            variant="contained"
            className="reservation-btn-primary"
            disabled={!selectedTime || isModifyingTurn}
            sx={{ ml: 2 }}
          >
            {isModifyingTurn ? (
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