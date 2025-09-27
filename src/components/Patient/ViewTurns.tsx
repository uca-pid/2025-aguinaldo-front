import { 
  Box, Button, Typography, CircularProgress, Chip, FormControl, InputLabel, Select, MenuItem, Avatar 
} from "@mui/material";
import { useMachines } from "#/providers/MachineProvider";
import { useAuthMachine } from "#/providers/AuthProvider";
import dayjs from "dayjs";
import { SignInResponse } from "#/models/Auth";
import { useEffect, useState } from "react";
import { TurnService } from "#/service/turn-service.service";
import type { TurnModifyRequest } from "#/models/TurnModifyRequest";
import ListAltIcon from "@mui/icons-material/ListAlt";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import "./ViewTurns.css";

const ViewTurns: React.FC = () => {
  const { uiSend, turnState, turnSend } = useMachines();
  const { authState } = useAuthMachine();
  const user: SignInResponse = authState?.context?.authResponse || {};
  const [pendingModifyRequests, setPendingModifyRequests] = useState<TurnModifyRequest[]>([]);
  useEffect(() => {
    const fetchPendingRequests = async () => {
      if (!user.accessToken) return;
      try {
        const requests = await TurnService.getMyModifyRequests(user.accessToken);
        setPendingModifyRequests(requests.filter(r => r.status === "PENDING"));
      } catch {
        setPendingModifyRequests([]);
      }
    };
    fetchPendingRequests();
  }, [user.accessToken]);
  
  const turnContext = turnState.context;
  const showTurnsContext = turnContext.showTurns;
  const { cancellingTurnId, isCancellingTurn } = turnContext;

  const filteredTurns = turnContext.myTurns.filter((turn: any) => {
    let matchesStatus = true;

    if (showTurnsContext.statusFilter) {
      matchesStatus = turn.status === showTurnsContext.statusFilter;
    }

    return matchesStatus;
  });

  const handleCancelTurn = (turnId: string) => {
    if (!user.accessToken) return;
    turnSend({ type: "CANCEL_TURN", turnId });
  };

  const handleModifyTurn = (turnId: string) => {
  uiSend({ type: "NAVIGATE", to: `/patient/modify-turn/${turnId}` });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'Programado';
      case 'CANCELED':
        return 'Cancelado';
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

  const hasPendingModifyRequest = (turnId: string) => {
    return pendingModifyRequests.some(r => r.turnId === turnId);
  };

  const canModifyTurn = (turn: any) => {
    return turn.status === 'SCHEDULED' && !isTurnPast(turn.scheduledAt) && !hasPendingModifyRequest(turn.id);
  };

  const handleClose = () => {
    uiSend({ type: "NAVIGATE", to: "/patient" });
    turnSend({ type: "RESET_SHOW_TURNS" });
    turnSend({ type: "CLEAR_CANCEL_SUCCESS" });
  };

  return (
    <Box className="viewturns-container">
      {/* Header Section */}
      <Box className="viewturns-header">
        <Box className="viewturns-header-layout">
          <Box className="viewturns-back-button-container">
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleClose}
              className="viewturns-back-button"
            >
              Volver al Dashboard
            </Button>
          </Box>
          <Box className="viewturns-header-content">
            <Avatar className="viewturns-header-icon">
              <ListAltIcon sx={{ fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" className="viewturns-header-title">
                Mis Turnos
              </Typography>
              <Typography variant="h6" className="viewturns-header-subtitle">
                Consulta y gestiona tus citas médicas
              </Typography>
            </Box>
          </Box>
          <Box className="viewturns-header-spacer"></Box>
        </Box>
      </Box>

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
                  <MenuItem value="CANCELED">Cancelados</MenuItem>
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
                      <Typography variant="h6" className="viewturns-turn-datetime" style={{display: 'flex', alignItems: 'center', gap: 8}}>
                        {dayjs(turn.scheduledAt).format("DD/MM/YYYY - HH:mm")}
                        {turn.status === 'SCHEDULED' && isTurnPast(turn.scheduledAt) && (
                          <Chip 
                            label="Vencido" 
                            size="small" 
                            sx={{ ml: 1, backgroundColor: '#fbbf24', color: '#92400e', fontSize: '0.75rem' }} 
                          />
                        )}
                        <Chip
                          label={getStatusLabel(turn.status)}
                          className={`viewturns-status-chip status-${turn.status.toLowerCase()}`}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                        {hasPendingModifyRequest(turn.id) && (
                          <Chip
                            label="Cambio pendiente de aceptación"
                            size="small"
                            sx={{ ml: 1, backgroundColor: '#fffc58ff', color: '#222222ff', fontSize: '0.75rem' }}
                          />
                        )}
                      </Typography>
                      <Typography variant="body1" className="viewturns-turn-doctor">
                        Dr. {turn.doctorName}
                      </Typography>
                      <Typography variant="body2" className="viewturns-turn-specialty">
                        {turn.doctorSpecialty}
                      </Typography>
                    </Box>
                    <Box className="viewturns-turn-actions">
                      <Box style={{display: 'flex', gap: 16}}>
                        {canModifyTurn(turn) && (
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => handleModifyTurn(turn.id)}
                            className="viewturns-modify-btn"
                          >
                            Cambiar fecha/horario
                          </Button>
                        )}
                        {canCancelTurn(turn) && (
                          <Button 
                            variant="contained" 
                            size="small"
                            className="viewturns-cancel-btn"
                            onClick={() => handleCancelTurn(turn.id)}
                            disabled={isCancellingTurn && cancellingTurnId === turn.id}
                          >
                            {isCancellingTurn && cancellingTurnId === turn.id ? (
                              <>
                                <CircularProgress size={16} sx={{ mr: 1 }} />
                                Cancelando...
                              </>
                            ) : (
                              'Cancelar turno'
                            )}
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ))
            ) : (
              <Box className="viewturns-empty-state">
                <Box className="viewturns-empty-emoji">📅</Box>
                <Typography variant="h5" className="viewturns-empty-title">
                  No hay turnos disponibles
                </Typography>
                <Typography variant="body1" className="viewturns-empty-subtitle">
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
    </Box>
  );
};

export default ViewTurns;