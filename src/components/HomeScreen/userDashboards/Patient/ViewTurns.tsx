import { 
  Box, Button, Modal, Typography, CircularProgress, 
  Alert, Chip, FormControl, InputLabel, Select, MenuItem, Avatar 
} from "@mui/material";
import { useMachines } from "#/providers/MachineProvider";
import { useAuthMachine } from "#/providers/AuthProvider";
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";
import { DateCalendar } from "@mui/x-date-pickers";
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
    let matchesDate = true;
    let matchesStatus = true;

    if (showTurnsContext.dateSelected) {
      const turnDate = dayjs(turn.scheduledAt).format("DD/MM/YYYY");
      const selectedDate = showTurnsContext.dateSelected.format("DD/MM/YYYY");
      matchesDate = turnDate === selectedDate;
    }

    if (showTurnsContext.statusFilter) {
      matchesStatus = turn.status === showTurnsContext.statusFilter;
    }

    return matchesDate && matchesStatus;
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

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'RESERVED':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      case 'AVAILABLE':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'RESERVED':
        return 'Reservado';
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
              <ListAltIcon sx={{ fontSize: 32, color: 'white' }} />
            </Avatar>
            <Typography variant="h4" className="viewturns-header-title">
              Mis Turnos
            </Typography>
            <Typography variant="body1" className="viewturns-header-subtitle">
              Consulta y gestiona tus citas médicas
            </Typography>
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

          {/* Filters */}
          <Box className="viewturns-filters-container">
            <Typography variant="h6" className="viewturns-filters-title">
              Filtros de búsqueda
            </Typography>
            
            <Box className="viewturns-filters-row">
              <FormControl size="small" className="viewturns-filter-select">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={showTurnsContext.statusFilter}
                  label="Estado"
                  onChange={(e) => turnSend({
                    type: "UPDATE_FORM_SHOW_TURNS",
                    key: "statusFilter",
                    value: e.target.value
                  })}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="RESERVED">Reservados</MenuItem>
                  <MenuItem value="SCHEDULED">Programados</MenuItem>
                  <MenuItem value="COMPLETED">Completados</MenuItem>
                  <MenuItem value="CANCELLED">Cancelados</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box className="viewturns-calendar-container">
              <DemoContainer components={['DateCalendar']}>
                <DemoItem label="Filtrar por fecha (opcional)">
                  <DateCalendar
                    value={showTurnsContext.dateSelected}
                    onChange={(e) => {
                      turnSend({
                        type: "UPDATE_FORM_SHOW_TURNS",
                        key: "dateSelected",
                        value: e
                      });
                    }}
                  />
                </DemoItem>
              </DemoContainer>
            </Box>

            {(showTurnsContext.dateSelected || showTurnsContext.statusFilter) && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => turnSend({ type: "RESET_SHOW_TURNS" })}
                className="viewturns-clear-filters"
              >
                Limpiar filtros
              </Button>
            )}
          </Box>

          {/* Turns List */}
          <Box className="viewturns-list-container">
            <Typography variant="h6" className="viewturns-list-header">
              {showTurnsContext.dateSelected 
                ? `Turnos del ${showTurnsContext.dateSelected.format("DD/MM/YYYY")}`
                : 'Todos mis turnos'
              }
              {showTurnsContext.statusFilter && ` - ${getStatusLabel(showTurnsContext.statusFilter)}`}
            </Typography>

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
                        {(turn.status === 'RESERVED' || turn.status === 'SCHEDULED') && (
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