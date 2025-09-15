import { 
  Box, Button, Modal, Typography, CircularProgress, 
  Alert, Chip, FormControl, InputLabel, Select, MenuItem, Avatar 
} from "@mui/material";
import { useMachines } from "#/providers/MachineProvider";
import { useAuthMachine } from "#/providers/AuthProvider";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { SignInResponse } from "#/models/Auth";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ScheduleIcon from "@mui/icons-material/Schedule";
import "./ViewTurns.css";

const ViewTurns: React.FC = () => {
  const { ui, turn } = useMachines();
  const { auth } = useAuthMachine();
  const { context: uiContext, send: uiSend } = ui;
  const { context: authContext, authResponse: authResponse } = auth;
  const user = authResponse as SignInResponse
  const { state: turnState, send: turnSend } = turn;
  const [cancellingTurnId, setCancellingTurnId] = useState<string | null>(null);
  const [completingTurnId, setCompletingTurnId] = useState<string | null>(null);
  const [absentTurnId, setAbsentTurnId] = useState<string | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);
  const [completeSuccess, setCompleteSuccess] = useState<string | null>(null);
  const [absentSuccess, setAbsentSuccess] = useState<string | null>(null);
  
  const formContext = uiContext.toggleStates || {};
  const reservations = formContext["showDoctorReservations"] ?? false;
  const turnContext = turnState.context;
  const showTurnsContext = turnContext.showTurns;

  useEffect(() => {
    if (reservations && authContext.isAuthenticated && user.accessToken) {
      turnSend({
        type: "SET_AUTH",
        accessToken: user.accessToken,
        userId: user.id || ""
      });
      turnSend({ type: "LOAD_MY_TURNS" });
    }
  }, [reservations, authContext.isAuthenticated, user.accessToken, turnSend]);

  const filteredTurns = turnContext.myTurns.filter((turn: any) => {
    let matchesStatus = true;
    let matchesDate = true;

    if (showTurnsContext.statusFilter) {
      matchesStatus = turn.status === showTurnsContext.statusFilter;
    }

    if (showTurnsContext.dateSelected) {
      const turnDate = dayjs(turn.scheduledAt).format('YYYY-MM-DD');
      const selectedDate = showTurnsContext.dateSelected.format('YYYY-MM-DD');
      matchesDate = turnDate === selectedDate;
    }

    return matchesStatus && matchesDate;
  });

  const handleCancelTurn = async (turnId: string) => {
    if (!user.accessToken) return;
    
    setCancellingTurnId(turnId);
    try {
      const response = await fetch(`/api/turns/${turnId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setCancelSuccess('Turno cancelado exitosamente');
        turnSend({ type: "LOAD_MY_TURNS" });
        setTimeout(() => setCancelSuccess(null), 3000);
      } else {
        const errorData = await response.text();
        console.error('Error cancelling turn:', errorData);
      }
    } catch (error) {
      console.error('Error cancelling turn:', error);
    } finally {
      setCancellingTurnId(null);
    }
  };

  const handleCompleteTurn = async (turnId: string) => {
    if (!user.accessToken) return;
    
    setCompletingTurnId(turnId);
    try {
      const response = await fetch(`/api/turns/${turnId}/complete`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setCompleteSuccess('Turno marcado como completado exitosamente');
        turnSend({ type: "LOAD_MY_TURNS" });
        setTimeout(() => setCompleteSuccess(null), 3000);
      } else {
        const errorData = await response.text();
        console.error('Error completing turn:', errorData);
      }
    } catch (error) {
      console.error('Error completing turn:', error);
    } finally {
      setCompletingTurnId(null);
    }
  };

  const handleMarkAbsent = async (turnId: string) => {
    if (!user.accessToken) return;
    
    setAbsentTurnId(turnId);
    try {
      const response = await fetch(`/api/turns/${turnId}/absent`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setAbsentSuccess('Turno marcado como ausente exitosamente');
        turnSend({ type: "LOAD_MY_TURNS" });
        setTimeout(() => setAbsentSuccess(null), 3000);
      } else {
        const errorData = await response.text();
        console.error('Error marking turn as absent:', errorData);
      }
    } catch (error) {
      console.error('Error marking turn as absent:', error);
    } finally {
      setAbsentTurnId(null);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'Programado';
      case 'COMPLETED':
        return 'Completado';
      case 'CANCELED':
        return 'Cancelado';
      case 'ABSENT':
        return 'Ausente';
      case 'AVAILABLE':
        return 'Disponible';
      default:
        return status;
    }
  };

  const isTurnPast = (scheduledAt: string) => {
    return dayjs(scheduledAt).isBefore(dayjs());
  };

  const canCancelTurn = (turn: any) => {
    return turn.status === 'SCHEDULED' && !isTurnPast(turn.scheduledAt);
  };

  const canCompleteTurn = (turn: any) => {
    return turn.status === 'SCHEDULED' && isTurnPast(turn.scheduledAt);
  };

  const canMarkAbsent = (turn: any) => {
    return turn.status === 'SCHEDULED' && isTurnPast(turn.scheduledAt);
  };

  const handleClose = () => {
    uiSend({ type: "TOGGLE", key: "showDoctorReservations" });
    turnSend({ type: "RESET_SHOW_TURNS" });
    setCancelSuccess(null);
    setCompleteSuccess(null);
    setAbsentSuccess(null);
  };
  return (
    <>
      <Modal open={reservations} onClose={handleClose}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box className="doctor-viewturns-modal-container">
            <Box className="doctor-viewturns-header">
              <Avatar className="doctor-viewturns-header-icon">
                <ScheduleIcon sx={{ fontSize: 40, color: 'white' }} />
              </Avatar>
              <Box className="doctor-viewturns-header-content">
                <Typography variant="h4" className="doctor-viewturns-header-title">
                  Mis Turnos
                </Typography>
                <Typography variant="body1" className="doctor-viewturns-header-subtitle">
                  Consulta y gestiona tus citas médicas
                </Typography>
              </Box>
            </Box>

            {turnContext.myTurnsError && (
              <Alert severity="error" className="doctor-viewturns-alert">
                Error al cargar turnos: {turnContext.myTurnsError}
              </Alert>
            )}

            {cancelSuccess && (
              <Alert severity="success" className="doctor-viewturns-alert">
                {cancelSuccess}
              </Alert>
            )}

            {completeSuccess && (
              <Alert severity="success" className="doctor-viewturns-alert">
                {completeSuccess}
              </Alert>
            )}

            {absentSuccess && (
              <Alert severity="success" className="doctor-viewturns-alert">
                {absentSuccess}
              </Alert>
            )}

            <Box className="doctor-viewturns-content">
              <Box className="doctor-viewturns-filters-section">
                <Box className="doctor-viewturns-filters-header">
                  <Typography variant="h6" className="doctor-viewturns-section-title">
                    🔍 Filtros
                  </Typography>
                  <Box className="doctor-viewturns-filters-controls">
                    <FormControl size="small" className="doctor-viewturns-filter-select">
                      <InputLabel>Estado del turno</InputLabel>
                      <Select
                        value={showTurnsContext.statusFilter}
                        label="Estado del turno"
                        onChange={(e) => turnSend({
                          type: "UPDATE_FORM_SHOW_TURNS",
                          key: "statusFilter",
                          value: e.target.value
                        })}
                      >
                        <MenuItem value="">Todos los estados</MenuItem>
                        <MenuItem value="SCHEDULED">Programados</MenuItem>
                        <MenuItem value="COMPLETED">Completados</MenuItem>
                        <MenuItem value="CANCELED">Cancelados</MenuItem>
                        <MenuItem value="ABSENT">Ausentes</MenuItem>
                      </Select>
                    </FormControl>

                    {showTurnsContext.statusFilter && (
                      <Button
                        variant="outlined"
                        onClick={() => turnSend({
                          type: "UPDATE_FORM_SHOW_TURNS",
                          key: "statusFilter",
                          value: ""
                        })}
                        className="doctor-viewturns-clear-filter-btn"
                      >
                        Limpiar filtro
                      </Button>
                    )}
                  </Box>
                </Box>
              </Box>

              <Box className="doctor-viewturns-list-section">
                <Box className="doctor-viewturns-list-content">
                {turnContext.isLoadingMyTurns ? (
                  <Box className="doctor-viewturns-loading-container">
                    <CircularProgress size={24} />
                    <Typography className="doctor-viewturns-loading-text">
                      Cargando turnos...
                    </Typography>
                  </Box>
                ) : filteredTurns.length > 0 ? (
                  filteredTurns.map((turn: any, index: number) => (
                    <Box key={turn.id || index} className="doctor-viewturns-turn-item">
                      <Box className="doctor-viewturns-turn-content">
                        <Box className="doctor-viewturns-turn-info">
                          <Typography variant="h6" className="doctor-viewturns-turn-datetime">
                            {dayjs(turn.scheduledAt).format("DD/MM/YYYY - HH:mm")}
                            {turn.status === 'SCHEDULED' && isTurnPast(turn.scheduledAt) && (
                              <Chip 
                                label="Vencido" 
                                size="small" 
                                sx={{ 
                                  ml: 1, 
                                  backgroundColor: '#fbbf24', 
                                  color: '#92400e',
                                  fontSize: '0.75rem'
                                }} 
                              />
                            )}
                          </Typography>
                          <Typography variant="body1" className="doctor-viewturns-turn-patient">
                            Paciente: {turn.patientName || "Paciente"}
                          </Typography>
                          {turn.reason && (
                            <Typography variant="body2" className="doctor-viewturns-turn-reason">
                              Motivo: {turn.reason}
                            </Typography>
                          )}
                        </Box>
                        <Box className="doctor-viewturns-turn-actions">
                          <Chip
                            label={getStatusLabel(turn.status)}
                            className={`doctor-viewturns-status-chip status-${turn.status.toLowerCase()}`}
                            size="small"
                          />
                          {canCancelTurn(turn) && (
                            <Button 
                              variant="contained" 
                              size="small"
                              className="doctor-viewturns-cancel-btn"
                              onClick={() => handleCancelTurn(turn.id)}
                              disabled={cancellingTurnId === turn.id}
                            >
                              {cancellingTurnId === turn.id ? (
                                <>
                                  <CircularProgress size={16} sx={{ mr: 1 }} />
                                  Cancelando...
                                </>
                              ) : (
                                'Cancelar'
                              )}
                            </Button>
                          )}
                          {canCompleteTurn(turn) && (
                            <Button 
                              variant="contained" 
                              size="small"
                              className="doctor-viewturns-complete-btn"
                              onClick={() => handleCompleteTurn(turn.id)}
                              disabled={completingTurnId === turn.id}
                              sx={{
                                backgroundColor: '#10b981',
                                '&:hover': {
                                  backgroundColor: '#059669'
                                }
                              }}
                            >
                              {completingTurnId === turn.id ? (
                                <>
                                  <CircularProgress size={16} sx={{ mr: 1 }} />
                                  Completando...
                                </>
                              ) : (
                                'Marcar Completado'
                              )}
                            </Button>
                          )}
                          {canMarkAbsent(turn) && (
                            <Button 
                              variant="contained" 
                              size="small"
                              className="doctor-viewturns-absent-btn"
                              onClick={() => handleMarkAbsent(turn.id)}
                              disabled={absentTurnId === turn.id}
                              sx={{
                                backgroundColor: '#f59e0b',
                                '&:hover': {
                                  backgroundColor: '#d97706'
                                }
                              }}
                            >
                              {absentTurnId === turn.id ? (
                                <>
                                  <CircularProgress size={16} sx={{ mr: 1 }} />
                                  Marcando...
                                </>
                              ) : (
                                'Marcar Ausente'
                              )}
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Box className="doctor-viewturns-empty-state">
                    <Typography>
                      {showTurnsContext.dateSelected || showTurnsContext.statusFilter
                        ? 'No hay turnos que coincidan con los filtros seleccionados'
                        : 'No tenés turnos registrados'
                      }
                    </Typography>
                  </Box>
                )}
              </Box>
              </Box>
            </Box>

            <Box className="doctor-viewturns-actions">
              <Button 
                onClick={handleClose} 
                className="doctor-viewturns-btn-close"
                variant="outlined"
              >
                Cerrar
              </Button>
            </Box>
          </Box>
        </LocalizationProvider>
      </Modal>
    </>
  );
};

export default ViewTurns;