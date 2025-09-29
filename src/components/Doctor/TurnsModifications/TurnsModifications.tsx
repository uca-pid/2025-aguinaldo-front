import { 
  Box, Button, Typography, CircularProgress, Avatar, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions
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
import ScheduleIcon from "@mui/icons-material/Schedule";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Patient } from "#/models/Doctor"
import "./TurnsModifications.css";
import { useDataMachine } from "#/providers/DataProvider"

const TurnsModifications: React.FC = () => {
  const { dataState, dataSend } = useDataMachine();
  const { uiSend } = useMachines();
  const { authState } = useAuthMachine();

  const dataContext = dataState.context;
  const user: SignInResponse = authState?.context?.authResponse || {};
  const patients: Patient[] = dataContext.doctorPatients || [];
  const [pendingModifyRequests, setPendingModifyRequests] = useState<TurnModifyRequest[]>([]);
  const [loadingApprove, setLoadingApprove] = useState<string | null>(null);
  const [loadingReject, setLoadingReject] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; action: 'approve' | 'reject' | null; requestId: string | null }>({ open: false, action: null, requestId: null });

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.name} ${patient.surname}` : `Paciente ID: ${patientId}`;
  };

  useEffect(() => {
    const fetchPendingRequests = async () => {
      if (!user.accessToken) return;
      try {
        const requests = await TurnService.getDoctorModifyRequests(user.id, user.accessToken);
        setPendingModifyRequests(requests.filter(r => r.status === "PENDING"));
      } catch {
        setPendingModifyRequests([]);
      }
    };
    fetchPendingRequests();
  }, [user.accessToken]);

  useEffect(() => {
    if (!dataContext.doctorPatients) {
      dataSend({ type: "LOAD_DOCTOR_PATIENTS" });
    }
  }, [dataContext.doctorPatients, dataSend]);

  const handleApprove = async (requestId: string) => {
    if (!user.accessToken) return;
    setLoadingApprove(requestId);
    try {
      await TurnService.approveModifyRequest(requestId, user.accessToken);
      // Refrescar la lista
      const requests = await TurnService.getDoctorModifyRequests(user.id, user.accessToken);
      setPendingModifyRequests(requests.filter(r => r.status === "PENDING"));
      uiSend({type: "OPEN_SNACKBAR", message: "Solicitud aprobada correctamente", severity: "success"});
    } catch (error) {
      console.error("Error approving request", error);
      uiSend({type: "OPEN_SNACKBAR", message: "Error al aprobar la solicitud", severity: "error"});
    } finally {
      setLoadingApprove(null);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!user.accessToken) return;
    setLoadingReject(requestId);
    try {
      await TurnService.rejectModifyRequest(requestId, user.accessToken);
      // Refrescar la lista
      const requests = await TurnService.getDoctorModifyRequests(user.id, user.accessToken);
      setPendingModifyRequests(requests.filter(r => r.status === "PENDING"));
      uiSend({type: "OPEN_SNACKBAR", message: "Solicitud rechazada correctamente", severity: "success"});
    } catch (error) {
      console.error("Error rejecting request", error);
      uiSend({type: "OPEN_SNACKBAR", message: "Error al rechazar la solicitud", severity: "error"});
    } finally {
      setLoadingReject(null);
    }
  };

  const handleClose = () => {
    uiSend({ type: "NAVIGATE", to: "/doctor" });
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
                Solicitudes Pendientes
              </Typography>
              <Typography variant="h6" className="viewturns-header-subtitle">
                Gestiona los cambios de turnos de tus pacientes
              </Typography>
            </Box>
          </Box>
          <Box className="viewturns-header-spacer"></Box>
        </Box>
      </Box>

      <Box className="viewturns-content">

        {/* Turns List Section */}
        <Box className="viewturns-list-section">
          <Box className="viewturns-list-content">
            {pendingModifyRequests.length > 0 ? (
              pendingModifyRequests.map((request, index) => {
                const isDateChange = dayjs(request.currentScheduledAt).format("YYYY-MM-DD") !== dayjs(request.requestedScheduledAt).format("YYYY-MM-DD");
                const isTimeChange = dayjs(request.currentScheduledAt).format("HH:mm") !== dayjs(request.requestedScheduledAt).format("HH:mm");
                
                return (
                  <Card key={request.id || index} sx={{ mb: 2, boxShadow: 1, borderRadius: 1, maxWidth: 700, mx: 'auto', '&:hover': { boxShadow: 3, transform: 'translateY(-2px)' }, transition: 'all 0.2s ease-in-out' }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box display={{ xs: 'block', md: 'flex' }} alignItems="center" gap={{ xs: 2, md: 3 }}>
                        <Box flex={1} display={{ xs: 'block', md: 'flex' }} alignItems="center" gap={{ xs: 1, md: 2 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.secondary', mb: { xs: 1, md: 0 } }}>
                            {getPatientName(request.patientId)}
                          </Typography>
                          
                          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems="center" justifyContent="center" gap={{ xs: 1, md: 2 }} flex={1}>
                            <Box textAlign="center" sx={{ minWidth: { xs: 90, md: 110 }, p: { xs: 1, md: 1.5 }, bgcolor: 'warning.50', borderRadius: 1 }}>
                              <Typography variant="body2" color="warning.main" sx={{ fontWeight: 500, mb: 1, fontSize: '0.8rem' }}>
                                Actual
                              </Typography>
                              <Box display="flex" alignItems="center" gap={1}>
                                <ScheduleIcon sx={{ fontSize: 20, color: 'text.primary', marginBottom: '6px' }} />
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                                    {dayjs(request.currentScheduledAt).format("DD/MM/YYYY")}
                                  </Typography>
                                  <Typography variant="body2" color="warning.main" sx={{ fontSize: '0.8rem' }}>
                                    {dayjs(request.currentScheduledAt).format("HH:mm")}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                            
                            <ArrowForwardIcon sx={{ color: isDateChange || isTimeChange ? 'warning.main' : 'primary.main', fontSize: 24, transform: { xs: 'rotate(90deg)', md: 'none' } }} />
                            
                            <Box textAlign="center" sx={{ minWidth: { xs: 90, md: 110 }, p: { xs: 1, md: 1.5 }, bgcolor: 'success.50', borderRadius: 1 }}>
                              <Typography variant="body2" color="success.main" sx={{ fontWeight: 500, mb: 1, fontSize: '0.8rem' }}>
                                Solicitado
                              </Typography>
                              <Box display="flex" alignItems="center" gap={1}>
                                <ScheduleIcon sx={{ fontSize: 20, color: 'text.primary' }} />
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem', color: isDateChange ? 'success.main' : 'text.primary' }}>
                                    {dayjs(request.requestedScheduledAt).format("DD/MM/YYYY")}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: 'success.main', fontSize: '0.8rem' }}>
                                    {dayjs(request.requestedScheduledAt).format("HH:mm")}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                        
                        <Box display="flex" flexDirection="column" gap={1} alignItems="center" mt={{ xs: 2, md: 0 }}>
                          <Button
                            variant="text"
                            size="small"
                            color="success"
                            onClick={() => setConfirmDialog({ open: true, action: 'approve', requestId: request.id })}
                            disabled={loadingApprove === request.id || loadingReject === request.id}
                            sx={{ minWidth: 100, fontSize: '0.8rem', textTransform: 'none' }}
                          >
                            {loadingApprove === request.id ? (
                              <>
                                <CircularProgress size={14} sx={{ mr: 0.5 }} />
                                Aprobando...
                              </>
                            ) : (
                              'Aprobar'
                            )}
                          </Button>
                          <Button
                            variant="text"
                            size="small"
                            color="error"
                            onClick={() => setConfirmDialog({ open: true, action: 'reject', requestId: request.id })}
                            disabled={loadingApprove === request.id || loadingReject === request.id}
                            sx={{ minWidth: 100, fontSize: '0.8rem', textTransform: 'none' }}
                          >
                            {loadingReject === request.id ? (
                              <>
                                <CircularProgress size={14} sx={{ mr: 0.5 }} />
                                Rechazando...
                              </>
                            ) : (
                              'Rechazar'
                            )}
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Box className="viewturns-empty-state">
                <Box className="viewturns-empty-emoji">📅</Box>
                <Typography variant="h5" className="viewturns-empty-title">
                  No hay solicitudes pendientes
                </Typography>
                <Typography variant="body1" className="viewturns-empty-subtitle">
                  Todas las solicitudes han sido procesadas
                </Typography>
              </Box>
            )}
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
              handleApprove(confirmDialog.requestId);
            } else if (confirmDialog.action === 'reject' && confirmDialog.requestId) {
              handleReject(confirmDialog.requestId);
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