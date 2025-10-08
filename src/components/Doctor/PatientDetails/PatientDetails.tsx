import {Avatar,Box,Button,Chip,Divider,Typography,Alert,CircularProgress,Paper} from "@mui/material"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { useMachines } from "#/providers/MachineProvider"
import { ArrowBack, PersonOutlined, BadgeOutlined, EmailOutlined,PhoneOutlined,CakeOutlined,WcOutlined,
  FiberManualRecordOutlined} from '@mui/icons-material'
import { calculateAge } from "#/models/Doctor"
import './PatientDetails.css'
import { useDataMachine } from "#/providers/DataProvider"
import MedicalHistoryManager from "../MedicalHistoryManager/MedicalHistoryManager"

const PatientDetails: React.FC = () => {
  const { dataState, dataSend } = useDataMachine();
  const { uiSend, doctorState, doctorSend } = useMachines();

  const doctorContext = doctorState.context;
  const dataContext = dataState.context;

  const isLoading = dataContext.loading.doctorPatients;
  const error = dataContext.errors.doctorPatients;

  const patient = doctorContext.selectedPatient;

  const handleBack = () => {
    uiSend({ type: "NAVIGATE", to: "/doctor/view-patients" });
    doctorSend({ type: "CLEAR_PATIENT_SELECTION" });
  };

  const handleHistoryUpdate = () => {

    dataSend({ type: "RETRY_DOCTOR_PATIENTS" });
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
            Volver
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
              <MedicalHistoryManager
                patientId={patient.id}
                patientName={patient.name}
                patientSurname={patient.surname}
                onHistoryUpdate={handleHistoryUpdate}
              />
            </Paper>
          </Box>

        </Box>

      </Box>
    </LocalizationProvider>
  );
};

export default PatientDetails;