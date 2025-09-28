import {
  Box, Button, Typography, CircularProgress,
  Container
} from "@mui/material";
import React from "react";
import { useMachines } from "#/providers/MachineProvider";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";
import { DateCalendar } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  formatDateTime,
  shouldDisableDate
} from "#/utils/dateTimeUtils";
import TimeSlotSelector from "#/components/shared/TimeSlotSelector/TimeSlotSelector";
import "./ModifyTurn.css";

const ModifyTurn: React.FC = () => {
  const { uiSend, turnState, turnSend } = useMachines();

  const { isLoadingTurnDetails, isModifyingTurn, isLoadingAvailableSlots, modifyError, availableTurns } = turnState.context;
  const { currentTurn, selectedDate, selectedTime, availableDates } = turnState.context.modifyTurn;

  console.log("Available Turns:", availableTurns);

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
    console.error("No current turn found in context:", turnState.context.modifyTurn);
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
                <strong>Especialidad:</strong> {currentTurn.doctorSpecialty || 'No especificada'}
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
                  <DemoContainer components={['DateCalendar']} sx={{ width: '100%' }}>
                    <DemoItem>
                      <DateCalendar
                        value={selectedDate ? dayjs(selectedDate) : null}
                        onChange={(newValue) => {
                          turnSend({ type: "UPDATE_FORM", path: ["modifyTurn", "selectedDate"], value: newValue });
                          turnSend({ type: "UPDATE_FORM", path: ["modifyTurn", "selectedTime"], value: null });
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
                  selectedDate={selectedDate ? dayjs(selectedDate) : null}
                  availableSlots={availableTurns}
                  selectedTime={selectedTime}
                  onTimeSelect={(timeSlot) => turnSend({ type: "UPDATE_FORM", path: ["modifyTurn", "selectedTime"], value: timeSlot })}
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
            onClick={() => turnSend({ type: "SUBMIT_MODIFY_REQUEST" })}
            variant="contained"
            className="reservation-btn-primary"
            disabled={!selectedDate || !selectedTime || isModifyingTurn}
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