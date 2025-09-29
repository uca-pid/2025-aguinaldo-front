import { 
  Box, Button, Typography, CircularProgress, Avatar, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions
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
import ScheduleIcon from "@mui/icons-material/Schedule";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
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
    <Box className="viewturns-container">
      {/* Header Section */}
      <Box className="viewturns-header">
        <Box className="viewturns-header-layout">
          <Box className="viewturns-back-button-container">
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => uiSend({ type: "NAVIGATE", to: "/doctor" })}
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