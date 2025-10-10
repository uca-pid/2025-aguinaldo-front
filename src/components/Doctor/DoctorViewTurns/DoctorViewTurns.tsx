import { 
  Box, Button, Typography, CircularProgress, Chip, FormControl, InputLabel, Select, MenuItem, Avatar,
} from "@mui/material";
import { useMachines } from "#/providers/MachineProvider";
import { useAuthMachine } from "#/providers/AuthProvider";
import { useDataMachine } from "#/providers/DataProvider";
import dayjs from "dayjs";
import { SignInResponse } from "#/models/Auth";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { filterTurns } from "#/utils/filterTurns";
import ListAltIcon from "@mui/icons-material/ListAlt";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import "./DoctorViewTurns.css";

const ViewTurns: React.FC = () => {
  const { turnState, turnSend, uiSend } = useMachines();
  const { authState } = useAuthMachine();
  const { dataState } = useDataMachine();
  const authContext = authState?.context;
  const user = authContext?.authResponse as SignInResponse;
  
  const turnContext = turnState.context;
  const dataContext = dataState.context;
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

  const truncateFileName = (fileName: string | undefined) => {
    if (!fileName) return 'Archivo del paciente';
    const maxLength = 20;
    return fileName.length > maxLength ? `${fileName.substring(0, maxLength)}...` : fileName;
  };

  const getTurnFileInfo = (turnId: string) => {
    const fileInfo = dataContext.turnFiles?.[turnId] || null;
    return fileInfo;
  };

  const getFileStatus = (turnId: string) => {
    if (dataContext.loading.turnFiles) {
      return "loading";
    }
    
    if (!dataContext.turnFiles) {
      return "no-data";
    }
    
    const fileInfo = dataContext.turnFiles[turnId];
    if (fileInfo) {
      return "has-file";
    } else {
      return "no-file";
    }
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
                        
                        {(() => {
                          const fileStatus = getFileStatus(turn.id);
                          if (fileStatus === "has-file") {
                            return (
                              <Typography variant="body2" sx={{ 
                                color: '#1976d2', 
                                fontWeight: 500, 
                                mt: 0.5,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5
                              }}>
                                ! Archivo subido por el paciente
                              </Typography>
                            );
                          }
                          return null;
                        })()}
                      </Box>
                      <Box className="viewturns-turn-actions">
                        <Box className="viewturns-main-actions">
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
                        
                        <Box className="viewturns-file-actions">
                          {(() => {
                            const fileStatus = getFileStatus(turn.id);
                            
                            if (fileStatus === "loading" || fileStatus === "no-data") {
                              return (
                                <Button
                                  variant="text"
                                  size="small"
                                  disabled
                                  className="viewturns-load-file-info-btn"
                                >
                                  <CircularProgress size={16} sx={{ mr: 1 }} />
                                  {fileStatus === "loading" ? "Verificando archivos..." : "Cargando información de archivos..."}
                                </Button>
                              );
                            }
                            
                            if (fileStatus === "has-file") {
                              const fileInfo = getTurnFileInfo(turn.id);
                              return (
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<AttachFileIcon />}
                                  onClick={() => window.open(fileInfo?.url, '_blank')}
                                  className="viewturns-view-file-btn"
                                  sx={{ 
                                    textTransform: 'none',
                                    fontSize: '0.875rem',
                                    backgroundColor: '#e3f2fd',
                                    borderColor: '#2196f3',
                                    color: '#1976d2',
                                    '&:hover': {
                                      backgroundColor: '#bbdefb',
                                      borderColor: '#1976d2'
                                    }
                                  }}
                                >
                                  {truncateFileName(fileInfo?.fileName)}
                                </Button>
                              );
                            }
                            
                            return null;
                          })()}
                        </Box>
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
      </Box>
    </LocalizationProvider>
  );
};

export default ViewTurns;