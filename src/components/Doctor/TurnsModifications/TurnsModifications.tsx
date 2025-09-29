import { 
  Box, Button, Typography, CircularProgress, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, List, ListItem, ListItemText, Divider
} from "@mui/material";
import { useMachines } from "#/providers/MachineProvider";
import { useAuthMachine } from "#/providers/AuthProvider";
import dayjs from "dayjs";
import { SignInResponse } from "#/models/Auth";
import { useState } from "react";
import { useEffect } from "react";
import type { TurnModifyRequest } from "#/models/TurnModifyRequest";
import ListAltIcon from "@mui/icons-material/ListAlt";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { Patient } from "#/models/Doctor"
import "./TurnsModifications.css";
import { useDataMachine } from "#/providers/DataProvider"
import { approveModifyRequest, rejectModifyRequest } from "#/utils/turnModificationsUtils";

const TurnsModifications: React.FC = () => {
  const { dataState, dataSend } = useDataMachine();
  const { uiSend } = useMachines();
  const { authState } = useAuthMachine();

  const dataContext = dataState.context;
  const user: SignInResponse = authState?.context?.authResponse || {};
  const patients: Patient[] = dataContext.doctorPatients || [];
  const pendingModifyRequests: TurnModifyRequest[] = dataContext.doctorModifyRequests?.filter((r: TurnModifyRequest) => r.status === "PENDING") || [];

  const [loadingApprove, setLoadingApprove] = useState<string | null>(null);
  const [loadingReject, setLoadingReject] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; action: 'approve' | 'reject' | null; requestId: string | null }>({ open: false, action: null, requestId: null });

  useEffect(() => {
    if (!dataContext.doctorPatients || dataContext.doctorPatients.length === 0) {
      dataSend({ type: "LOAD_DOCTOR_PATIENTS" });
    }
    if (!dataContext.doctorModifyRequests || dataContext.doctorModifyRequests.length === 0) {
      dataSend({ type: "LOAD_DOCTOR_MODIFY_REQUESTS" });
    }
  }, [dataContext.doctorPatients, dataContext.doctorModifyRequests, dataSend]);

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      return `${patient.name} ${patient.surname}`;
    } else {
      return `Paciente ID: ${patientId}`;
    }
  };

  return (
    <Box className="turnsmod-container">
      <Box className="shared-header">
        <Box className="shared-header-layout">
          <Box className="shared-back-button-container">
            <Button startIcon={<ArrowBackIcon />} onClick={() => uiSend({ type: "NAVIGATE", to: "/doctor" })}
              className="shared-back-button" variant="outlined">        
              Volver
            </Button>
          </Box>
          <Box className="shared-header-content">
            <Avatar className="shared-header-icon">
              <ListAltIcon sx={{ fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" className="shared-header-title">
                Solicitudes Pendientes
              </Typography>
              <Typography variant="h6" className="shared-header-subtitle">
                Gestiona los cambios de turnos de tus pacientes
              </Typography>
            </Box>
          </Box>
          <Box className="shared-header-spacer"></Box>
        </Box>
      </Box>

      <Box className="turnsmod-content">
        <Box className="turnsmod-list-section">
          <Box className="turnsmod-list-content">
            {dataContext.loading.doctorModifyRequests ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                <CircularProgress />
                <Typography variant="body1" sx={{ ml: 2 }}>
                  Cargando solicitudes...
                </Typography>
              </Box>
            ) : dataContext.errors.doctorModifyRequests ? (
              <Box display="flex" flexDirection="column" alignItems="center" minHeight={200} justifyContent="center">
                <Typography variant="h6" color="error" sx={{ mb: 2 }}>
                  Error al cargar solicitudes
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {dataContext.errors.doctorModifyRequests}
                </Typography>
                <Button variant="outlined" onClick={() => dataSend({ type: "LOAD_DOCTOR_MODIFY_REQUESTS" })}>
                  Reintentar
                </Button>
              </Box>
            ) : pendingModifyRequests.length > 0 ? (
              <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 1 }}>
                {pendingModifyRequests.map((request, index) => {
                  const isDateChange = dayjs(request.currentScheduledAt).format("YYYY-MM-DD") !== dayjs(request.requestedScheduledAt).format("YYYY-MM-DD");
                  const isTimeChange = dayjs(request.currentScheduledAt).format("HH:mm") !== dayjs(request.requestedScheduledAt).format("HH:mm");
                  
                  return (
                    <Box key={request.id || index}>
                      <ListItem
                        alignItems="flex-start"
                        secondaryAction={
                          <Box display="flex" flexDirection="column" gap={0.5}>
                            <IconButton
                              color="success"
                              onClick={() => setConfirmDialog({ open: true, action: 'approve', requestId: request.id })}
                              disabled={loadingApprove === request.id || loadingReject === request.id}
                              sx={{ fontSize: '1.5rem' }}
                            >
                              {loadingApprove === request.id ? (
                                <CircularProgress size={20} />
                              ) : (
                                <CheckIcon />
                              )}
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => setConfirmDialog({ open: true, action: 'reject', requestId: request.id })}
                              disabled={loadingApprove === request.id || loadingReject === request.id}
                              sx={{ fontSize: '1.5rem' }}
                            >
                              {loadingReject === request.id ? (
                                <CircularProgress size={20} />
                              ) : (
                                <CloseIcon />
                              )}
                            </IconButton>
                          </Box>
                        }
                        sx={{ px: 3, py: 2 }}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                              {getPatientName(request.patientId)}
                            </Typography>
                          }
                          secondary={
                            <Typography component="div">
                              <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} gap={{ xs: 1, md: 2 }} mt={1}>
                                <Typography variant="body1" sx={{ color: '#22577a', fontSize: '1rem' }}>
                                  {dayjs(request.currentScheduledAt).format("DD/MM/YYYY HH:mm")}
                                </Typography>
                                
                                <Box display="flex" alignItems="center" gap={1} sx={{ alignSelf: { xs: 'center', md: 'auto' } }}>
                                  <ArrowForwardIcon sx={{ color: isDateChange || isTimeChange ? '#2d7d90' : 'primary.main', fontSize: 20, transform: { xs: 'rotate(90deg)', md: 'none' } }} />
                                  {isDateChange && isTimeChange && (
                                    <Typography variant="body2" sx={{ color: '#2d7d90', fontSize: '0.8rem' }}>
                                      Nueva fecha y horario
                                    </Typography>
                                  )}
                                  {isDateChange && !isTimeChange && (
                                    <Typography variant="body2" sx={{ color: '#2d7d90', fontSize: '0.8rem' }}>
                                      Nueva fecha
                                    </Typography>
                                  )}
                                  {!isDateChange && isTimeChange && (
                                    <Typography variant="body2" sx={{ color: '#2d7d90', fontSize: '0.8rem' }}>
                                      Nuevo horario
                                    </Typography>
                                  )}
                                </Box>
                                
                                <Typography variant="body1" sx={{ color: '#40a3a5', fontSize: '1rem' }}>
                                  {dayjs(request.requestedScheduledAt).format("DD/MM/YYYY HH:mm")}
                                </Typography>
                              </Box>
                            </Typography>
                          }
                        />
                      </ListItem>
                      {index < pendingModifyRequests.length - 1 && <Divider />}
                    </Box>
                  );
                })}
              </List>
            ) : (
              <Box className="turnsmod-empty-state">
                <Box className="turnsmod-empty-emoji">📅</Box>
                <Typography variant="h5" className="turnsmod-empty-title">
                  No hay solicitudes pendientes
                </Typography>
                <Typography variant="body1" className="turnsmod-empty-subtitle">
                  Todas las solicitudes han sido procesadas
                </Typography>
              </Box>
            ) }
          </Box>
        </Box>
      </Box>

      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, action: null, requestId: null })}>
        <DialogTitle>Confirmar Acción</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres {confirmDialog.action === 'approve' ? 'aprobar' : 'rechazar'} esta solicitud de modificación de turno?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, action: null, requestId: null })}>Cancelar</Button>
          <Button onClick={() => {
            if (confirmDialog.action === 'approve' && confirmDialog.requestId) {
              approveModifyRequest(confirmDialog.requestId, user.accessToken!, dataSend, uiSend, setLoadingApprove);
            } else if (confirmDialog.action === 'reject' && confirmDialog.requestId) {
              rejectModifyRequest(confirmDialog.requestId, user.accessToken!, dataSend, uiSend, setLoadingReject);
            }
            setConfirmDialog({ open: false, action: null, requestId: null });
          }} color={confirmDialog.action === 'approve' ? 'success' : 'error'}>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TurnsModifications;