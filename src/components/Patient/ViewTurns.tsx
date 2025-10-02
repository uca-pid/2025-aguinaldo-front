import { 
  Box, Button, Typography, CircularProgress, Chip, FormControl, InputLabel, Select, MenuItem, Avatar 
} from "@mui/material";
import { useMachines } from "#/providers/MachineProvider";
import { useDataMachine } from "#/providers/DataProvider";
import dayjs from "dayjs";
import type { TurnModifyRequest } from "#/models/TurnModifyRequest";
import ListAltIcon from "@mui/icons-material/ListAlt";
import EditIcon from "@mui/icons-material/Edit";
import "./ViewTurns.css";
import { orchestrator } from "#/core/Orchestrator";
import { filterTurns } from "#/utils/filterTurns";

const ViewTurns: React.FC = () => {
  const { turnState, turnSend, uiSend } = useMachines();
  const { dataState } = useDataMachine();

  const turnContext = turnState.context;
  const dataContext = dataState.context;
  const showTurnsContext = turnContext.showTurns;
  const { cancellingTurnId, isCancellingTurn } = turnContext;

  // Obtener los turnos del dataContext en lugar del turnContext
  const allTurns = dataContext.myTurns || [];
  const filteredTurns = filterTurns(allTurns, showTurnsContext.statusFilter);
  const pendingModifyRequests = dataContext.myModifyRequests?.filter((r: TurnModifyRequest) => r.status === "PENDING") || [];

  const handleCancelTurn = (turnId: string) => {
    const turnData = allTurns.find((turn: any) => turn.id === turnId);
    uiSend({ 
      type: "OPEN_CANCEL_TURN_DIALOG", 
      turnId,
      turnData
    });
  };

  const handleModifyTurn = (turnId: string) => {
    orchestrator.send({ type: "NAVIGATE", to: '/patient/modify-turn?turnId=' + turnId });
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
    return pendingModifyRequests.some((r: TurnModifyRequest) => r.turnId === turnId);
  };

  const canModifyTurn = (turn: any) => {
    return turn.status === 'SCHEDULED' && !isTurnPast(turn.scheduledAt) && !hasPendingModifyRequest(turn.id);
  };

  return (
    <Box className="shared-container">
      {/* Header Section */}
      <Box className="shared-header">
        <Box className="shared-header-layout">
          <Box className="shared-header-content">
            <Avatar className="shared-header-icon">
              <ListAltIcon sx={{ fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" className="shared-header-title">
                Mis Turnos
              </Typography>
              <Typography variant="h6" className="shared-header-subtitle">
                Consulta y gestiona tus citas médicas
              </Typography>
            </Box>
          </Box>
          <Box className="shared-header-spacer"></Box>
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
                    type: "UPDATE_FORM",
                    path: ["statusFilter"],
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
                    type: "UPDATE_FORM",
                    path: ["statusFilter"],
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
                        {turn.status === 'SCHEDULED' && isTurnPast(turn.scheduledAt) ? (
                          <Chip 
                            label="Vencido" 
                            size="small"
                            color="default"
                            sx={{ ml: 1, fontSize: '0.75rem' }} 
                          />
                        ) : !hasPendingModifyRequest(turn.id) ? (
                          <Chip
                            label={getStatusLabel(turn.status)}
                            className={`viewturns-status-chip status-${turn.status.toLowerCase()}`}
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        ) : null}
                        {hasPendingModifyRequest(turn.id) && (
                          <Chip
                            label="Cambio pendiente de aceptación"
                            size="small"
                            color="info"
                            sx={{ ml: 1, fontSize: '0.75rem' }}
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