import {Avatar,Box,Button,Card,CardContent,Chip,Divider,Typography,Alert,CircularProgress,Paper,TextField} from "@mui/material"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { useMachines } from "#/providers/MachineProvider"
import { ArrowBack, PersonOutlined, BadgeOutlined, EmailOutlined,PhoneOutlined,CakeOutlined,WcOutlined,HistoryOutlined,
  FiberManualRecordOutlined,Edit,Save,Cancel} from '@mui/icons-material'
import { calculateAge } from "#/models/Doctor"
import './PatientDetails.css'
import { useDataMachine } from "#/providers/DataProvider"

const PatientDetails: React.FC = () => {
  const { dataState, dataSend } = useDataMachine();
  const { uiState, uiSend, doctorState, doctorSend } = useMachines();

  const doctorContext = doctorState.context;
  const dataContext = dataState.context;
  const uiContext = uiState.context;

  const isLoading = dataContext.loading.doctorPatients;
  const error = dataContext.errors.doctorPatients;

  const patient = doctorContext.selectedPatient;
  const isEditingHistory = uiContext.toggleStates?.['editingMedicalHistory'] || false;
  const editedHistory = doctorContext.editedHistory;
  const isSavingHistory = doctorContext.isSavingHistory; 

  const handleBack = () => {
    uiSend({ type: "NAVIGATE", to: "/doctor/view-patients" });
    doctorSend({ type: "CLEAR_PATIENT_SELECTION" });
  };


  const handleEditHistory = () => {
    uiSend({ type: "TOGGLE", key: "editingMedicalHistory" });
    doctorSend({ type: "START_EDIT_HISTORY" });
  };

  const handleSaveHistory = () => {
    doctorSend({ type: "SAVE_HISTORY" });
    uiSend({ type: "TOGGLE", key: "editingMedicalHistory" });
  };

  const handleCancelEdit = () => {
    uiSend({ type: "TOGGLE", key: "editingMedicalHistory" });
  };

  const handleHistoryChange = (value: string) => {
    doctorSend({ type: "UPDATE_HISTORY", value });
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

  if (isLoading) {
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box className="patient-details-container">
          <Box className="patient-details-loading">
            <CircularProgress size={40} />
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Cargando información del paciente...
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
            Volver a Pacientes
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

  if (!patient) {
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
            Volver a Pacientes
          </Button>
          <Alert severity="warning">
            No se encontró el paciente solicitado.
          </Alert>
        </Box>
      </LocalizationProvider>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box className="patient-details-container">
        
        <Box className="patient-details-header">
          <Button
            startIcon={<ArrowBack />}
            onClick={handleBack}
            className="patient-details-back-button"
            variant="outlined"
          >
            Volver a Pacientes
          </Button>
        </Box>


        <Card className="patient-details-main-card patient-details-card-animation" elevation={2}>
          <CardContent>
            <Box className="patient-details-header-info">
              <Avatar 
                className="patient-details-avatar"
                sx={{ width: 80, height: 80, fontSize: '2rem' }}
              >
                {getInitials(patient.name, patient.surname)}
              </Avatar>
              <Box className="patient-details-basic-info">
                <Typography variant="h4" component="h1" className="patient-details-name">
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
          </CardContent>
        </Card>


        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 2 }}>
          

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
                <HistoryOutlined color="primary" />
                Historia Clínica
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {isEditingHistory ? (
                <Box className="patient-details-edit-container">
                  <TextField
                    multiline
                    rows={6}
                    fullWidth
                    value={editedHistory}
                    onChange={(e) => handleHistoryChange(e.target.value)}
                    placeholder="Ingrese la historia clínica del paciente..."
                    variant="outlined"
                    className="patient-details-history-input"
                    sx={{
                      '& .MuiOutlinedInput-root': {borderRadius: '12px',transition: 'all 0.3s ease',
                      '&:hover': {boxShadow: '0 4px 12px rgba(34, 87, 122, 0.15)'},
                      '&.Mui-focused': {boxShadow: '0 4px 16px rgba(34, 87, 122, 0.25)'}
                      }
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleCancelEdit}
                      disabled={isSavingHistory}
                      startIcon={<Cancel />}
                      className="patient-details-cancel-button"
                      sx={{
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 500,
                        padding: '8px 16px',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)'
                        }
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSaveHistory}
                      disabled={isSavingHistory}
                      startIcon={isSavingHistory ? <CircularProgress size={16} color="inherit" /> : <Save />}
                      className="patient-details-save-button"
                      sx={{
                        background: 'linear-gradient(135deg, #57cc99 0%, #80ed99 100%)',
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 600,
                        padding: '8px 20px',
                        boxShadow: '0 4px 14px rgba(87, 204, 153, 0.3)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #80ed99 0%, #57cc99 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(87, 204, 153, 0.4)'
                        },
                        '&:disabled': {
                          background: '#e5e7eb',
                          color: '#9ca3af',
                          boxShadow: 'none'
                        }
                      }}
                    >
                      {isSavingHistory ? 'Guardando...' : 'Guardar Historia'}
                    </Button>
                  </Box>
                </Box>
              ) : (
                <>
                  {patient.medicalHistory ? (
                    <Box className="patient-details-history-content">
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                        {patient.medicalHistory}
                      </Typography>
                    </Box>
                  ) : (
                    <Box className="patient-details-no-history">
                      <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 3 }}>
                        No hay historia clínica registrada para este paciente.
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={handleEditHistory}
                      startIcon={<Edit />}
                      className="patient-details-edit-button"
                      sx={{
                        background: 'linear-gradient(135deg, #22577a 0%, #38a3a5 100%)',
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 600,
                        padding: '8px 20px',
                        boxShadow: '0 4px 14px rgba(34, 87, 122, 0.3)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #38a3a5 0%, #22577a 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(34, 87, 122, 0.4)'
                        }
                      }}
                    >
                      {patient.medicalHistory ? 'Editar Historia Clínica' : 'Agregar Historia Clínica'}
                    </Button>
                  </Box>
                </>
              )}
            </Paper>
          </Box>

        </Box>

      </Box>
    </LocalizationProvider>
  );
};

export default PatientDetails;