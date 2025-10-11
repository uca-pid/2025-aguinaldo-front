import React from "react";
import { 
  Box, Button, Typography, CircularProgress, Chip, FormControl, InputLabel, Select, MenuItem, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Tooltip
} from "@mui/material";
import { useMachines } from "#/providers/MachineProvider";
import { useAuthMachine } from "#/providers/AuthProvider";
import dayjs from "dayjs";
import { SignInResponse } from "#/models/Auth";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { filterTurns } from "#/utils/filterTurns";
import ListAltIcon from "@mui/icons-material/ListAlt";
import HistoryIcon from "@mui/icons-material/History";
import "./DoctorViewTurns.css";

const ViewTurns: React.FC = () => {
  
  const { turnState, turnSend, uiState,uiSend, medicalHistorySend, medicalHistoryState } = useMachines();
  const { authState } = useAuthMachine();
  const authContext = authState?.context;
  const user = authContext?.authResponse as SignInResponse;
  
  const turnContext = turnState.context;
  const showTurnsContext = turnContext.showTurns;
  const { cancellingTurnId, isCancellingTurn } = turnContext;

  const filteredTurns = filterTurns(turnContext.myTurns, showTurnsContext.statusFilter);

  const handleCancelTurn = (turnId: string) => {
    if (!user.accessToken) return;
    const turnData = filteredTurns.find((turn: any) => turn.id === turnId);
    uiSend({ 
      type: "OPEN_CANCEL_TURN_DIALOG", 
      turnId,
      turnData,
      title: "Cancelar Turno",
      message: "¿Estás seguro de que quieres cancelar este turno? Esta acción no se puede deshacer.",
      confirmButtonText: "Cancelar Turno",
      confirmButtonColor: "error"
    });
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

  const canAddMedicalHistory = (turn: any) => {
    if (!turn.patientId) return false;
    return turn.status === 'COMPLETED' || (turn.status === 'SCHEDULED' && isTurnPast(turn.scheduledAt));
  };

  const getMedicalHistoryButtonTooltip = (turn: any) => {
    if (!turn.patientId) return "Este turno no tiene paciente asignado";
    if (turn.status === 'CANCELED') return "No se puede agregar historia a turnos cancelados";
    if (turn.status === 'SCHEDULED' && !isTurnPast(turn.scheduledAt)) return "Solo se puede agregar historia después de la consulta";
    return "";
  };

  const handleAddMedicalHistory = (turn: any) => {
    console.log('Adding medical history for turn:', turn.id, 'patient:', turn.patientId);
    
    // First, load medical history for this patient to check for existing entries
    medicalHistorySend({
      type: 'LOAD_PATIENT_MEDICAL_HISTORY',
      patientId: turn.patientId,
      accessToken: user.accessToken,
    });

    // Wait a bit for the medical histories to load before checking
    setTimeout(() => {
      const existingHistory = medicalHistoryState.context.medicalHistories?.find(
        (history: any) => history.turnId === turn.id
      );
      
      if (existingHistory) {
        uiSend({
          type: 'OPEN_SNACKBAR',
          message: 'Ya existe una entrada de historia médica para este turno',
          severity: 'info'
        });
        return;
      }

      medicalHistorySend({
        type: 'SELECT_HISTORY',
        history: { id: turn.id, ...turn }
      });
      
      uiSend({ type: 'TOGGLE', key: 'medicalHistoryDialog' });
    }, 300); // Short delay to allow medical history to load
  };

  const handleSaveMedicalHistory = () => {
    const selectedTurn = medicalHistoryState.context.selectedHistory;
    const newContent = medicalHistoryState.context.newHistoryContent;
    
    if (!newContent.trim() || !selectedTurn || !user.accessToken || !user.id) {
      return;
    }

    console.log('Sending ADD_HISTORY_ENTRY_FOR_TURN event for turn:', selectedTurn.id);
    
    medicalHistorySend({
      type: 'ADD_HISTORY_ENTRY_FOR_TURN',
      turnId: selectedTurn.id,
      content: newContent.trim(),
      accessToken: user.accessToken,
      doctorId: user.id,
      turnInfo: {
        patientName: selectedTurn.patientName,
        scheduledAt: selectedTurn.scheduledAt,
        status: selectedTurn.status,
      },
    });

    uiSend({ type: 'TOGGLE', key: 'medicalHistoryDialog' });
    medicalHistorySend({ type: 'CLEAR_SELECTION' });
  };

  const handleCloseMedicalHistoryDialog = () => {
    uiSend({ type: 'TOGGLE', key: 'medicalHistoryDialog' });
    medicalHistorySend({ type: 'CLEAR_SELECTION' });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>

      <Box className="viewturns-container">          
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
                        path: ["showTurns", "statusFilter"],
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
                        path: ["showTurns", "statusFilter"],
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
                          {turn.status === 'SCHEDULED' && isTurnPast(turn.scheduledAt) ? (
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
                          ) : (
                            <Chip
                              label={getStatusLabel(turn.status)}
                              className={`viewturns-status-chip status-${turn.status.toLowerCase()}`}
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Typography>
                        <Typography variant="body1" className="viewturns-turn-patient">
                          Paciente: {turn.patientName || "Paciente"}
                        </Typography>
                        {turn.reason && (
                          <Typography variant="body2" className="viewturns-turn-reason">
                            Motivo: {turn.reason}
                          </Typography>
                        )}
                      </Box>
                      <Box className="viewturns-turn-actions">
                        {canAddMedicalHistory(turn) ? (
                          <Button 
                            variant="outlined" 
                            size="small"
                            className="viewturns-history-btn"
                            onClick={() => handleAddMedicalHistory(turn)}
                            startIcon={<HistoryIcon />}
                            sx={{ mr: 1 }}
                          >
                            Agregar Historia
                          </Button>
                        ) : (
                          <Tooltip title={getMedicalHistoryButtonTooltip(turn)} arrow>
                            <span>
                              <Button 
                                variant="outlined" 
                                size="small"
                                className="viewturns-history-btn"
                                disabled
                                startIcon={<HistoryIcon />}
                                sx={{ mr: 1 }}
                              >
                                Agregar Historia
                              </Button>
                            </span>
                          </Tooltip>
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

          {/* Medical History Dialog - Using State Machines */}
          <Dialog 
            open={uiState.context.toggleStates.medicalHistoryDialog || false}
            onClose={handleCloseMedicalHistoryDialog}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              Agregar Historia Médica
            </DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                multiline
                rows={6}
                fullWidth
                label="Observaciones Médicas"
                placeholder="Ingrese diagnóstico, tratamiento, observaciones del paciente..."
                value={medicalHistoryState.context.newHistoryContent || ''}
                onChange={(e) => medicalHistorySend({ type: 'SET_NEW_CONTENT', content: e.target.value })}
                variant="outlined"
                margin="normal"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseMedicalHistoryDialog}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveMedicalHistory}
                variant="contained"
                disabled={!(medicalHistoryState.context.newHistoryContent || '').trim() || medicalHistoryState.context.isLoading}
              >
                {medicalHistoryState.context.isLoading ? (
                  <>
                    <CircularProgress size={16} sx={{ mr: 1 }} />
                    Guardando...
                  </>
                ) : (
                  'Guardar Historia'
                )}
              </Button>
            </DialogActions>
          </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default ViewTurns;