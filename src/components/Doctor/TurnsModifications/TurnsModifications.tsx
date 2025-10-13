import { 
  Box, Typography, Avatar, Chip, Paper, CircularProgress
} from "@mui/material";
import { useMachines } from "#/providers/MachineProvider";
import dayjs from "#/utils/dayjs.config";
import type { TurnModifyRequest } from "#/models/TurnModifyRequest";
import ListAltIcon from "@mui/icons-material/ListAlt";
import { Patient } from "#/models/Doctor"
import "./TurnsModifications.css";
import { useDataMachine } from "#/providers/DataProvider"
import PendingCard from "#/components/shared/PendingCard/PendingCard";

const TurnsModifications: React.FC = () => {
  const { dataState } = useDataMachine();
  const { uiState, uiSend } = useMachines();

  const dataContext = dataState.context;
  const patients: Patient[] = dataContext.doctorPatients || [];
  const pendingModifyRequests: TurnModifyRequest[] = dataContext.doctorModifyRequests?.filter((r: TurnModifyRequest) => r.status === "PENDING") || [];
  const isLoadingPatients = dataContext.loading?.doctorPatients || false;
  const isLoadingRequest = dataContext.loading?.doctorModifyRequests || false;
  const loadingApprove = uiState.context.toggleStates.loadingApprove;
  const loadingReject = uiState.context.toggleStates.loadingReject;

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      return `${patient.name} ${patient.surname}`;
    } else {
      // Si estamos cargando, mostrar estado de carga
      if (isLoadingPatients) {
        return "Cargando paciente...";
      }
      // Si ya terminó de cargar pero no encontramos el paciente específico
      return `Paciente ID: ${patientId}`;
    }
  };

  return (
    <Box className="turnsmod-container">
      <Box className="shared-header">
        <Box className="shared-header-layout">
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

      <Box maxWidth="lg" className="pending-content-container" sx={{ mx: 'auto', px: 3 }}>
        {/* Pending Turn Modification Requests */}
        { (isLoadingRequest || loadingApprove || loadingReject) ? (
          <Box className="pending-empty-state">
            <CircularProgress size={24} />
            <Typography variant="h6" className="pending-empty-title">
              Cargando solicitudes...
            </Typography>
          </Box>
        ) : pendingModifyRequests.length > 0 ? (
          <Box>
            <Box className="pending-status-chip-container">
              <Chip
                label={`${pendingModifyRequests.length} solicitud(es) pendiente(s)`}
                className="pending-status-chip"
              />
            </Box>

            <Box className="pending-cards-container">
              {pendingModifyRequests.map((request, index) => {
                const isDateChange = dayjs(request.currentScheduledAt).format("YYYY-MM-DD") !== dayjs(request.requestedScheduledAt).format("YYYY-MM-DD");
                const isTimeChange = dayjs(request.currentScheduledAt).format("HH:mm") !== dayjs(request.requestedScheduledAt).format("HH:mm");

                return (
                  <PendingCard
                    key={request.id || index}
                    id={request.id}
                    title={getPatientName(request.patientId)}
                    avatarContent={<ListAltIcon sx={{ fontSize: 28 }} />}
                    onApprove={(id) => uiSend({ 
                      type: "OPEN_CONFIRMATION_DIALOG", 
                      action: 'approve', 
                      requestId: String(id),
                      title: "Aprobar Solicitud",
                      message: "¿Estás seguro de que quieres aprobar esta solicitud de modificación de turno?",
                      confirmButtonText: "Aprobar",
                      confirmButtonColor: "success"
                    })}
                    onReject={(id) => uiSend({ 
                      type: "OPEN_CONFIRMATION_DIALOG", 
                      action: 'reject', 
                      requestId: String(id),
                      title: "Rechazar Solicitud",
                      message: "¿Estás seguro de que quieres rechazar esta solicitud de modificación de turno?",
                      confirmButtonText: "Rechazar",
                      confirmButtonColor: "error"
                    })}
                    isLoading={uiState.context.toggleStates.loadingApprove === request.id || uiState.context.toggleStates.loadingReject === request.id}
                  >
                    <Typography variant="body2" color="text.secondary">
                      <strong>Fecha actual:</strong> {dayjs(request.currentScheduledAt).format("DD/MM/YYYY HH:mm")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Fecha solicitada:</strong> {dayjs(request.requestedScheduledAt).format("DD/MM/YYYY HH:mm")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Cambio:</strong> {
                        isDateChange && isTimeChange ? 'Nueva fecha y horario' :
                        isDateChange ? 'Nueva fecha' :
                        isTimeChange ? 'Nuevo horario' : 'Sin cambios'
                      }
                    </Typography>
                  </PendingCard>
                );
              })}
            </Box>
          </Box>
        ) : (
          <Paper elevation={2} className="pending-empty-state">
            <Box className="pending-empty-emoji">📅</Box>
            <Typography variant="h5" className="pending-empty-title">
              No hay solicitudes pendientes
            </Typography>
            <Typography variant="body1" className="pending-empty-subtitle">
              Todas las solicitudes han sido procesadas
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default TurnsModifications;