import { 
  Avatar,
  Box, 
  Button, 
  List, 
  ListItem, 
  Typography,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert
} from "@mui/material"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { useMachines } from "#/providers/MachineProvider"
import HistoryIcon from '@mui/icons-material/History';
import { PeopleOutlined, SearchOutlined, PersonOutlined, BadgeOutlined, ArrowBack, } from '@mui/icons-material'
import { Patient, calculateAge } from "#/models/Doctor"
import './ViewPatients.css'

const ViewPatients: React.FC = () => {
    const { uiSend, doctorState, doctorSend } = useMachines();

    const doctorContext = doctorState.context;
    const patients: Patient[] = doctorContext.patients;
    const isLoading = doctorContext.isLoadingPatients;
    const error = doctorContext.patientsError;
    const searchTerm = doctorContext.patientSearchTerm;

    // Initialize patients data if not already loaded and we have auth
    if (!isLoading && patients.length === 0 && !error && doctorContext.accessToken && doctorContext.doctorId) {
        console.log("ViewPatients: Initializing patients page", {
            accessToken: !!doctorContext.accessToken,
            doctorId: doctorContext.doctorId,
            isLoading: isLoading,
            patients: patients,
            error: error
        });
        doctorSend({ type: "INIT_PATIENTS_PAGE" });
    }

    const handleBack = () => {
        uiSend({ type: "NAVIGATE", to: "/dashboard" });
    };

    const handleRetry = () => {
        doctorSend({ type: "RETRY" });
    };

    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.dni.toString().includes(searchTerm)
    );

    const getInitials = (name: string, surname: string) => {
        return (name[0] + surname[0]).toUpperCase();
    };

    const getFullName = (name: string, surname: string) => {
        return `${name} ${surname}`;
    };
    
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>

            <Box className="viewpatients-container">

                <Box className="viewpatients-header">
                    <Box className="viewpatients-header-layout">
                        <Box className="viewpatients-back-button-container">
                            <Button
                                startIcon={<ArrowBack />}
                                onClick={handleBack}
                                className="viewpatients-back-button"
                                variant="outlined"
                            >
                                Volver al Dashboard
                            </Button>
                        </Box>
                        
                        <Box className="viewpatients-header-content">
                            <Avatar className="viewpatients-header-icon">
                                <PeopleOutlined sx={{ fontSize: 28 }} />
                            </Avatar>
                            <Box>
                                <Typography variant="h4" component="h1" className="viewpatients-header-title">
                                    Mis Pacientes
                                </Typography>
                                <Typography variant="h6" className="viewpatients-header-subtitle">
                                    Gestiona y consulta la información de tus pacientes
                                </Typography>
                            </Box>
                        </Box>
                        <Box className="viewpatients-header-spacer"></Box>
                    </Box>
                </Box>

                <Box className="viewpatients-content">
                    <Box className="viewpatients-search-container">
                        <TextField
                            className="viewpatients-search-field"
                            placeholder="Buscar por nombre o DNI..."
                            value={searchTerm}
                            onChange={(e) => doctorSend({ type: "SET_PATIENT_SEARCH", searchTerm: e.target.value })}
                            disabled={isLoading}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchOutlined color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>

                    {error && (
                        <Alert 
                            severity="error" 
                            action={
                                <Button color="inherit" size="small" onClick={handleRetry}>
                                    Reintentar
                                </Button>
                            }
                            sx={{ mb: 2 }}
                        >
                            {error}
                        </Alert>
                    )}

                    {isLoading ? (
                        <Box className="viewpatients-empty-state">
                            <CircularProgress size={40} />
                            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                Cargando pacientes...
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            <Box className="viewpatients-patients-count">
                                <Typography variant="body2">
                                    {filteredPatients.length} de {patients.length} paciente{patients.length !== 1 ? 's' : ''}
                                    {searchTerm && ' encontrado' + (filteredPatients.length !== 1 ? 's' : '')}
                                </Typography>
                            </Box>

                            {filteredPatients.length > 0 ? (
                                <Box className="viewpatients-list-container">
                                    <List>
                                        {filteredPatients.map((patient) => (
                                            <ListItem key={patient.id} className="viewpatients-patient-card">
                                                <Box className="viewpatients-patient-info">
                                                    <Avatar className="viewpatients-patient-avatar">
                                                        {getInitials(patient.name, patient.surname)}
                                                    </Avatar>
                                                    <Box className="viewpatients-patient-details">
                                                        <Typography className="viewpatients-patient-name">
                                                            {getFullName(patient.name, patient.surname)}
                                                        </Typography>
                                                        <Box className="viewpatients-patient-info-row">
                                                            <Typography className="viewpatients-patient-info-item">
                                                                <PersonOutlined fontSize="small" />
                                                                {calculateAge(patient.birthdate) ? `${calculateAge(patient.birthdate)} años` : 'Edad no disponible'}
                                                            </Typography>
                                                            <Typography className="viewpatients-patient-info-item">
                                                                <BadgeOutlined fontSize="small" />
                                                                DNI: {patient.dni}
                                                            </Typography>
                                                            <Typography className="viewpatients-patient-info-item">
                                                                <HistoryIcon fontSize="small" />
                                                                Historia clínica: {patient.medicalHistory ? 'Historial disponible' : 'Sin historial'}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            ) : (
                                <Box className="viewpatients-empty-state">
                                    <Avatar className="viewpatients-empty-icon">
                                        <SearchOutlined />
                                    </Avatar>
                                    <Typography variant="h6" gutterBottom>
                                        {searchTerm ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {searchTerm 
                                            ? 'Intenta con otros términos de búsqueda' 
                                            : 'Los pacientes aparecerán aquí cuando tengas turnos asignados'
                                        }
                                    </Typography>
                                </Box>
                            )}
                        </>
                    )}
                </Box>
            </Box>
        
        </LocalizationProvider>
    )
}

export default ViewPatients