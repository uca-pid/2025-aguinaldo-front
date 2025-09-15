import { 
  Box, Button, Modal, Typography, CircularProgress, 
  Alert, Chip, FormControl, InputLabel, Select, MenuItem, Avatar 
} from "@mui/material";
import { useMachines } from "#/providers/MachineProvider";
import { useAuthMachine } from "#/providers/AuthProvider";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { SignInResponse } from "#/models/Auth";
import ListAltIcon from "@mui/icons-material/ListAlt";
import "./ViewTurns.css";

const ViewTurns: React.FC = () => {
  const { ui, turn } = useMachines();
  const { auth } = useAuthMachine();
  const { context: uiContext, send: uiSend } = ui;
  const { context: authContext, authResponse: authResponse } = auth;
  const user = authResponse as SignInResponse
  const { state: turnState, send: turnSend } = turn;
  const [cancellingTurnId, setCancellingTurnId] = useState<string | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);
  
  const formContext = uiContext.toggleStates || {};
  const reservations = formContext["reservations"] ?? false;
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

    if (showTurnsContext.statusFilter) {
      matchesStatus = turn.status === showTurnsContext.statusFilter;
    }

    return matchesStatus;
  });

  const handleCancelTurn = async (turnId: string) => {
    if (!user.accessToken) return;
    
    setCancellingTurnId(turnId);
    try {
      const response = await fetch(`http://localhost:8080/api/turns/${turnId}/cancel`, {
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'Programado';
      case 'COMPLETED':
        return 'Completado';
      case 'CANCELLED':
        return 'Cancelado';
      case 'AVAILABLE':
        return 'Disponible';
      default:
        return status;
    }
  };

  const handleClose = () => {
    uiSend({ type: "TOGGLE", key: "reservations" });
    turnSend({ type: "RESET_SHOW_TURNS" });
    setCancelSuccess(null);
  };

  return (
    <>
      <Modal open={reservations} onClose={handleClose}>
        <Box className="viewturns-modal-container">
          {/* Header */}
          <Box className="viewturns-header">
            <Avatar className="viewturns-header-icon">
              <ListAltIcon sx={{ fontSize: 40, color: 'white' }} />
            </Avatar>
            <Box className="viewturns-header-content">
              <Typography variant="h4" className="viewturns-header-title">
                Mis Turnos
              </Typography>
              <Typography variant="body1" className="viewturns-header-subtitle">
                Consulta y gestiona tus citas médicas
              </Typography>
            </Box>
          </Box>

          {/* Alerts */}
          {turnContext.myTurnsError && (
            <Alert severity="error" className="viewturns-alert">
              Error al cargar turnos: {turnContext.myTurnsError}
            </Alert>
          )}

          {cancelSuccess && (
            <Alert severity="success" className="viewturns-alert">
              {cancelSuccess}
            </Alert>
          )}

          {/* Main Content */}
          <Box className="viewturns-content">
            {/* Filters Section */}
            <Box className="viewturns-filters-section">
              <Box className="viewturns-filters-header">
                <Typography variant="h6" className="viewturns-section-title">
                  🔍 Filtros
                </Typography>
                <Box className="viewturns-filters-controls">
                  <FormControl size="small" className="viewturns-filter-select">
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
                      <MenuItem value="CANCELLED">Cancelados</MenuItem>
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
                      className="viewturns-clear-filter-btn"
                    >
                      Limpiar filtro
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Turns List Section */}
            <Box className="viewturns-list-section">
              <Box className="viewturns-list-content">
              {turnContext.isLoadingMyTurns ? (
                <Box className="viewturns-loading-container">
                  <CircularProgress size={24} />
                  <Typography className="viewturns-loading-text">
                    Cargando turnos...
                  </Typography>
                </Box>
              ) : filteredTurns.length > 0 ? (
                filteredTurns.map((turn: any, index: number) => (
                  <Box key={turn.id || index} className="viewturns-turn-item">
                    <Box className="viewturns-turn-content">
                      <Box className="viewturns-turn-info">
                        <Typography variant="h6" className="viewturns-turn-datetime">
                          {dayjs(turn.scheduledAt).format("DD/MM/YYYY - HH:mm")}
                        </Typography>
                        <Typography variant="body1" className="viewturns-turn-doctor">
                          Dr. {turn.doctorName}
                        </Typography>
                        <Typography variant="body2" className="viewturns-turn-specialty">
                          {turn.doctorSpecialty}
                        </Typography>
                      </Box>
                      <Box className="viewturns-turn-actions">
                        <Chip
                          label={getStatusLabel(turn.status)}
                          className={`viewturns-status-chip status-${turn.status.toLowerCase()}`}
                          size="small"
                        />
                        {turn.status === 'SCHEDULED' && (
                          <Button 
                            variant="contained" 
                            size="small"
                            className="viewturns-cancel-btn"
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
                      </Box>
                    </Box>
                  </Box>
                ))
              ) : (
                <Box className="viewturns-empty-state">
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

          {/* Actions */}
          <Box className="viewturns-actions">
            <Button 
              onClick={handleClose} 
              className="viewturns-btn-close"
              variant="outlined"
            >
              Cerrar
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default ViewTurns;