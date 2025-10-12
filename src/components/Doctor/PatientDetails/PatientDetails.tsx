import React from "react"
import {Avatar,Box,Button,Chip,Divider,Typography,Alert,CircularProgress,Paper,TextField} from "@mui/material"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { useMachines } from "#/providers/MachineProvider"
import { ArrowBack, PersonOutlined, BadgeOutlined, EmailOutlined,PhoneOutlined,CakeOutlined,WcOutlined,
  FiberManualRecordOutlined, AttachFile, History, Save} from '@mui/icons-material'
import { calculateAge } from "#/models/Doctor"
import './PatientDetails.css'
import { useDataMachine } from "#/providers/DataProvider"
import { useAuthMachine } from "#/providers/AuthProvider"
import dayjs from "dayjs"
import type { TurnResponse } from "#/models/Turn"
import type { MedicalHistory } from "#/models/MedicalHistory"

const PatientDetails: React.FC = () => {
  const { dataState, dataSend } = useDataMachine();
  const { doctorState, doctorSend, medicalHistoryState, medicalHistorySend } = useMachines();
  const { authState } = useAuthMachine();

  const doctorContext = doctorState.context;
  const dataContext = dataState.context;
  const authContext = authState?.context;
  const medicalHistoryContext = medicalHistoryState.context;

  const isLoading = dataContext.loading.doctorPatients;
  const error = dataContext.errors.doctorPatients;

  const patient = doctorContext.selectedPatient;

  const patientTurns: TurnResponse[] = dataContext.myTurns?.filter((turn: any) => 
    turn.patientId === patient?.id
  ) || [];

  const medicalHistories: MedicalHistory[] = medicalHistoryContext.medicalHistories || [];
  
  const isSelectingPatient = doctorState.matches({ patientManagement: 'selectingPatient' });
  
  // Check if we're on the patient-detail route without a patient ID
  const isPatientDetailRoute = window.location.pathname === '/patient-detail';
  const hasPatientIdParam = window.location.search.includes('patientId=');

  const handleEditMedicalHistory = (turnId: string, currentContent: string) => {
    medicalHistorySend({
      type: "SELECT_HISTORY",
      history: { turnId, content: currentContent } as MedicalHistory
    });
    medicalHistorySend({
      type: "SET_EDIT_CONTENT", 
      content: currentContent
    });
  };

  const handleSaveMedicalHistory = async (turnId: string) => {
    if (!authContext?.authResponse?.accessToken || !authContext?.authResponse?.id || !medicalHistoryContext.editingContent?.trim()) {
      return;
    }

    const existingHistory = medicalHistories.find(h => h.turnId === turnId);

    if (existingHistory) {
      medicalHistorySend({
        type: "UPDATE_HISTORY_ENTRY",
        historyId: existingHistory.id,
        content: medicalHistoryContext.editingContent.trim(),
        accessToken: authContext.authResponse.accessToken,
        doctorId: authContext.authResponse.id
      });
    } else {
      medicalHistorySend({
        type: "ADD_HISTORY_ENTRY_FOR_TURN",
        turnId,
        content: medicalHistoryContext.editingContent.trim(),
        accessToken: authContext.authResponse.accessToken,
        doctorId: authContext.authResponse.id
      });
    }
  };

  const handleCancelEdit = () => {
    medicalHistorySend({ type: "CLEAR_SELECTION" });
  };

  const getMedicalHistoryForTurn = (turnId: string): string => {
    const history = medicalHistories.find(h => h.turnId === turnId);
    return history?.content || '';
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

  const getTurnFileInfo = (turnId: string) => {
    const fileInfo = dataContext.turnFiles?.[turnId] || null;
    return fileInfo;
  };

  const truncateFileName = (fileName: string | undefined) => {
    if (!fileName) return 'Ver archivo';
    const maxLength = 20;
    return fileName.length > maxLength ? `${fileName.substring(0, maxLength)}...` : fileName;
  };

  const getTurnStatusLabel = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'Programado';
      case 'CANCELED':
        return 'Cancelado';
      case 'COMPLETED':
        return 'Completado';
      case 'AVAILABLE':
        return 'Disponible';
      default:
        return status;
    }
  };

  const getTurnStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'primary';
      case 'completed':
        return 'success';
      case 'canceled':
        return 'error';
      case 'available':
        return 'default';
      default:
        return 'default';
    }
  };

  const handleBack = () => {
    doctorSend({ type: "CLEAR_PATIENT_SELECTION" });
  };

  const getInitials = (name: string, surname: string) => {
    return (name[0] + surname[0]).toUpperCase();
  };

  const getFullName = (name: string, surname: string) => {
    return `${name} ${surname}`;
  };

  const formatBirthdate = (birthdate: string | undefined) => {
    if (!birthdate) return 'No disponible';
    try {
      return new Date(birthdate).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return birthdate;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'activo':
        return 'success';
      case 'inactive':
      case 'inactivo':
        return 'default';
      case 'pending':
      case 'pendiente':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'Activo';
      case 'inactive':
        return 'Inactivo';
      case 'pending':
        return 'Pendiente';
      default:
        return status;
    }
  };

  const getGenderIcon = (gender: string | undefined) => {
    if (!gender) return <WcOutlined />;
    switch (gender.toLowerCase()) {
      case 'male':
      case 'masculino':
      case 'm':
        return <WcOutlined color="primary" />;
      case 'female':
      case 'femenino':
 
      default:
        return <WcOutlined />;
    }
  };

  const getGenderLabel = (gender: string | undefined) => {
    if (!gender) return 'No especificado';
    switch (gender.toLowerCase()) {
      case 'male':
      case 'masculino':
      case 'm':
        return 'Masculino';
      case 'female':
      case 'femenino':
      case 'f':
        return 'Femenino';
      default:
        return gender;
    }
  };

  // Show loading state if data is loading OR if we're actively selecting a patient
  if (isLoading || isSelectingPatient) {
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box className="patient-details-container">
          <Box className="patient-details-loading" sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            minHeight: '60vh',
            gap: 2
          }}>
            <CircularProgress size={60} thickness={4} />
            <Typography variant="h5" gutterBottom sx={{ mt: 2, fontWeight: 500 }}>
              Cargando información del paciente...
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Por favor espere un momento
            </Typography>
          </Box>
        </Box>
      </LocalizationProvider>
    );
  }

  if (error) {
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box className="patient-details-container">
          <Button
            startIcon={<ArrowBack />}
            onClick={handleBack}
            className="patient-details-back-button"
            variant="outlined"
            sx={{ mb: 2 }}
          >
            Volver
          </Button>
          <Alert 
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => dataSend({ type: "RETRY_DOCTOR_PATIENTS" })}>
                Reintentar
              </Button>
            }
          >
            {error}
          </Alert>
        </Box>
      </LocalizationProvider>
    );
  }

  // Only show "not found" if:
  // 1. We're in idle state (not actively selecting)
  // 2. There's a selectedPatientId (we tried to find someone)
  // 3. But no patient was found (selectedPatient is null)
  // 4. AND we had attempts to find the patient (patientSelectionAttempts > 0)
  // OR if we're on the patient-detail route without a patientId parameter
  const shouldShowNotFound = !patient && (
    (doctorState.matches({ patientManagement: 'idle' }) && doctorContext.selectedPatientId && doctorContext.patientSelectionAttempts > 0) ||
    (isPatientDetailRoute && !hasPatientIdParam && !doctorContext.selectedPatientId)
  );
  
  if (shouldShowNotFound) {
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box className="patient-details-container">
          <Box className="shared-header">
            <Box className="shared-header-layout">
              <Box className="shared-back-button-container">
                <Button
                  startIcon={<ArrowBack />}
                  onClick={handleBack}
                  className="shared-back-button"
                  variant="outlined"
                >
                  Volver
                </Button>
              </Box>

              <Box className="shared-header-content">
                <Avatar className="shared-header-icon" sx={{ backgroundColor: '#ff9800' }}>
                  <PersonOutlined sx={{ fontSize: 28 }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="h1" className="shared-header-title">
                    Paciente No Encontrado
                  </Typography>
                  <Typography variant="h6" className="shared-header-subtitle">
                    No se pudo encontrar la información del paciente
                  </Typography>
                </Box>
              </Box>
              <Box className="shared-header-spacer"></Box>
            </Box>
          </Box>

          <Box className="patient-details-content">
            <Box sx={{ flex: '1 1 100%', display: 'flex', justifyContent: 'center' }}>
              <Paper elevation={1} sx={{ p: 4, maxWidth: 500, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                  No se encontró el paciente solicitado
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                  Es posible que el paciente haya sido eliminado o que no tengas permisos para acceder a esta información.
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleBack}
                  sx={{ mt: 1 }}
                >
                  Volver a la lista de pacientes
                </Button>
              </Paper>
            </Box>
          </Box>
        </Box>
      </LocalizationProvider>
    );
  }
  
  // If patient is null for any other reason, don't show anything (navigation in progress)
  if (!patient) {
    return null;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box className="patient-details-container">
        <Box className="shared-header">
          <Box className="shared-header-layout">
            <Box className="shared-back-button-container">
              <Button
                startIcon={<ArrowBack />}
                onClick={handleBack}
                className="shared-back-button"
                variant="outlined"
              >
                Volver
              </Button>
            </Box>

            <Box className="shared-header-content">
              <Avatar className="shared-header-icon">
                {getInitials(patient.name, patient.surname)}
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" className="shared-header-title">
                  {getFullName(patient.name, patient.surname)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Chip 
                    icon={<FiberManualRecordOutlined />}
                    label={getStatusLabel(patient.status)}
                    color={getStatusColor(patient.status) as any}
                    size="small"
                  />
                </Box>
              </Box>
            </Box>
            <Box className="shared-header-spacer"></Box>
          </Box>
        </Box>

        <Box className="patient-details-content">
          

          <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
            <Paper elevation={1} sx={{ p: 3 }} className="patient-details-info-paper">
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonOutlined color="primary" />
                Información Personal
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box className="patient-details-info-grid">
                <Box className="patient-details-info-item">
                  <Typography variant="body2" color="textSecondary" className="patient-details-label">
                    <BadgeOutlined fontSize="small" sx={{ mr: 1 }} />
                    DNI
                  </Typography>
                  <Typography variant="body1" className="patient-details-value">
                    {patient.dni}
                  </Typography>
                </Box>

                <Box className="patient-details-info-item">
                  <Typography variant="body2" color="textSecondary" className="patient-details-label">
                    <EmailOutlined fontSize="small" sx={{ mr: 1 }} />
                    Email
                  </Typography>
                  <Typography variant="body1" className="patient-details-value">
                    {patient.email}
                  </Typography>
                </Box>

                {patient.phone && (
                  <Box className="patient-details-info-item">
                    <Typography variant="body2" color="textSecondary" className="patient-details-label">
                      <PhoneOutlined fontSize="small" sx={{ mr: 1 }} />
                      Teléfono
                    </Typography>
                    <Typography variant="body1" className="patient-details-value">
                      {patient.phone}
                    </Typography>
                  </Box>
                )}

                <Box className="patient-details-info-item">
                  <Typography variant="body2" color="textSecondary" className="patient-details-label">
                    <CakeOutlined fontSize="small" sx={{ mr: 1 }} />
                    Fecha de Nacimiento
                  </Typography>
                  <Typography variant="body1" className="patient-details-value">
                    {formatBirthdate(patient.birthdate)}
                    {calculateAge(patient.birthdate) && (
                      <Typography variant="body2" color="textSecondary" component="span" sx={{ ml: 1 }}>
                        ({calculateAge(patient.birthdate)} años)
                      </Typography>
                    )}
                  </Typography>
                </Box>

                <Box className="patient-details-info-item">
                  <Typography variant="body2" color="textSecondary" className="patient-details-label">
                    {getGenderIcon(patient.gender)}
                    <span style={{ marginLeft: 8 }}>Género</span>
                  </Typography>
                  <Typography variant="body1" className="patient-details-value">
                    {getGenderLabel(patient.gender)}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>

  
          <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
            <Paper elevation={1} sx={{ p: 3 }} className="patient-details-medical-history-paper">
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <History color="primary" />
                Historia Clínica por Turno
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {medicalHistoryContext.isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : patientTurns.filter(turn => turn.status !== 'CANCELED' && turn.status !== 'CANCELLED').length === 0 ? (
                <Paper elevation={0} sx={{ p: 3, textAlign: 'center', backgroundColor: '#f8fafc' }}>
                  <Typography variant="body2" color="textSecondary">
                    No hay turnos válidos registrados con este paciente.
                  </Typography>
                </Paper>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {patientTurns
                    .filter(turn => turn.status !== 'CANCELED' && turn.status !== 'CANCELLED')
                    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
                    .map((turn) => {
                      const currentHistory = getMedicalHistoryForTurn(turn.id);
                      const isEditing = medicalHistoryContext.selectedHistory?.turnId === turn.id;
                      const fileStatus = getFileStatus(turn.id);
                      const fileInfo = getTurnFileInfo(turn.id);

                      return (
                        <Paper key={turn.id} elevation={2} sx={{ p: 2 }}>
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {dayjs(turn.scheduledAt).format("DD/MM/YYYY - HH:mm")}
                              </Typography>
                              <Chip
                                label={getTurnStatusLabel(turn.status)}
                                color={getTurnStatusColor(turn.status) as any}
                                size="small"
                              />
                            </Box>
                            
                            {/* File attachment info */}
                            {fileStatus === "has-file" && fileInfo && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <AttachFile sx={{ fontSize: 16, color: '#1976d2' }} />
                                <Button
                                  variant="text"
                                  size="small"
                                  onClick={() => window.open(fileInfo.url, '_blank')}
                                  sx={{ 
                                    textTransform: 'none',
                                    fontSize: '0.75rem',
                                    color: '#1976d2',
                                    minWidth: 'auto',
                                    p: 0,
                                    '&:hover': {
                                      backgroundColor: 'rgba(25, 118, 210, 0.04)',
                                      textDecoration: 'underline'
                                    }
                                  }}
                                >
                                  {truncateFileName(fileInfo.fileName)}
                                </Button>
                              </Box>
                            )}
                          </Box>

                          <Box>
                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                              Historia Médica:
                            </Typography>
                            
                            {isEditing ? (
                              <Box>
                                <TextField
                                  fullWidth
                                  multiline
                                  minRows={4}
                                  maxRows={10}
                                  value={medicalHistoryContext.editingContent || ''}
                                  onChange={(e) => medicalHistorySend({ 
                                    type: "SET_EDIT_CONTENT", 
                                    content: e.target.value 
                                  })}
                                  placeholder="Ingrese observaciones médicas, diagnóstico, tratamiento..."
                                  variant="outlined"
                                  size="small"
                                />
                                <Box sx={{ mt: 1, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                  <Button
                                    size="small"
                                    onClick={handleCancelEdit}
                                    disabled={medicalHistoryContext.isLoading}
                                  >
                                    Cancelar
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    startIcon={medicalHistoryContext.isLoading ? <CircularProgress size={16} /> : <Save />}
                                    onClick={() => handleSaveMedicalHistory(turn.id)}
                                    disabled={medicalHistoryContext.isLoading || !medicalHistoryContext.editingContent?.trim()}
                                  >
                                    {medicalHistoryContext.isLoading ? 'Guardando...' : 'Guardar'}
                                  </Button>
                                </Box>
                              </Box>
                            ) : (
                              <Box>
                                {currentHistory ? (
                                  <Paper 
                                    elevation={0} 
                                    sx={{ 
                                      p: 2, 
                                      backgroundColor: '#f8fafc',
                                      border: '1px solid #e2e8f0',
                                      mb: 1
                                    }}
                                  >
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word'
                                      }}
                                    >
                                      {currentHistory}
                                    </Typography>
                                  </Paper>
                                ) : (
                                  <Paper 
                                    elevation={0} 
                                    sx={{ 
                                      p: 2, 
                                      backgroundColor: '#fafafa',
                                      border: '1px dashed #ccc',
                                      mb: 1
                                    }}
                                  >
                                    <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                                      No hay historia médica registrada para este turno
                                    </Typography>
                                  </Paper>
                                )}
                                <Button
                                  size="small"
                                  startIcon={<History />}
                                  onClick={() => handleEditMedicalHistory(turn.id, currentHistory)}
                                  sx={{ mt: 1 }}
                                >
                                  {currentHistory ? 'Editar Historia' : 'Agregar Historia'}
                                </Button>
                              </Box>
                            )}
                          </Box>
                        </Paper>
                      );
                    })}
                </Box>
              )}
            </Paper>
          </Box>

        </Box>

      </Box>
    </LocalizationProvider>
  );
};

export default PatientDetails;