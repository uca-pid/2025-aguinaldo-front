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
    <Container maxWidth="lg" className="modify-turn-page-container">
      <Box className="modify-turn-page-header">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => uiSend({ type: "NAVIGATE", to: "/patient/view-turns" })}
          className="modify-turn-back-button"
          variant="outlined"
        >
          Volver a Mis Turnos
        </Button>
        <Button 
          onClick={() => uiSend({ type: "NAVIGATE", to: "/patient/view-turns" })} 
          className="modify-turn-btn-secondary"
          variant="outlined"
        >
          Cancelar
        </Button>
        <Typography variant="h5" className="modify-turn-title">
          Selecciona una nueva fecha y horario para tu cita
        </Typography>
      </Box>

        <Box className="modify-turn-current-info">
          <Typography variant="h6" className="modify-turn-section-title">
            📋 Información del Turno Actual
          </Typography>
          <Box className="modify-turn-info-card">
            <Typography variant="body1">
              <strong>Doctor:</strong> {currentTurn.doctorName}
            </Typography>
            <Typography variant="body1">
              <strong>Especialidad:</strong> {currentTurn.doctorSpecialty}
            </Typography>
            <Typography variant="body1">
              <strong>Fecha y Hora Actual:</strong> {formatDateTime(currentTurn.scheduledAt)}
            </Typography>
            <Typography variant="body1">
              <strong>Estado:</strong> 
              <span className={`modify-turn-status ${currentTurn.status?.toLowerCase()}`}>
                {currentTurn.status}
              </span>
            </Typography>
          </Box>
        </Box>

        <Box className="modify-turn-step2-container">
          <Box className="modify-turn-step2-content">
            <Box className="modify-turn-calendar-section">
              <Typography variant="h6" className="modify-turn-section-title">
                📅 Nueva Fecha
              </Typography>
              <Box className="modify-turn-calendar-container">
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

            <Box className="modify-turn-time-section">
              <Typography variant="h6" className="modify-turn-section-title">
                🕐 Nuevo Horario
              </Typography>
              <Box className="modify-turn-time-slots">
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
          <Box className="modify-turn-error-message">
            <Typography color="error" variant="body2">
              {modifyError}
            </Typography>
          </Box>
        )}

        {/* Campo para razón de la modificación */}
        <Box className="modify-turn-reason-section" sx={{ mt: 3, mb: 2 }}>
          <Typography variant="h6" className="modify-turn-section-title" sx={{ mb: 2 }}>
            💬 Motivo de la modificación (opcional)
          </Typography>
          <textarea
            value={reason}
            onChange={e => modifyTurnSend({ type: "UPDATE_FORM", key: "reason", value: e.target.value })}
            placeholder="Describe brevemente el motivo de la modificación..."
            className="modify-turn-reason-textarea"
            rows={3}
            maxLength={500}
          />
        </Box>

        <Box className="modify-turn-actions">
          <Button 
            onClick={() => uiSend({ type: "NAVIGATE", to: "/patient/view-turns" })} 
            className="modify-turn-btn-secondary"
            variant="outlined"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => modifyTurnSend({ type: "SUBMIT_MODIFY_REQUEST" })}
            variant="contained"
            className="modify-turn-btn-primary"
            disabled={!selectedTime || isModifyingTurn}
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
  );
};

export default ModifyTurn;