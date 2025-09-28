import { 
  Avatar,
  Box, 
  Button, 
  List, 
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Typography,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert
} from "@mui/material"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { useMachines } from "#/providers/MachineProvider"
import { PeopleOutlined, SearchOutlined, ArrowBack, ChevronRight } from '@mui/icons-material'
import { Patient } from "#/models/Doctor"
import { useEffect } from 'react'
import './ViewPatients.css'

const ViewPatients: React.FC = () => {
    const { uiSend, doctorState, doctorSend, dataState, dataSend } = useMachines();

    const doctorContext = doctorState.context;
    const dataContext = dataState.context;
    
    const patients: Patient[] = dataContext.doctorPatients || [];
    const isLoading = dataContext.loading.doctorPatients;
    const error = dataContext.errors.doctorPatients;
    const searchTerm = doctorContext.patientSearchTerm;

    // Debug logging
    console.log('ViewPatients Debug:', {
        isLoading,
        patientsLength: patients.length,
        error,
        accessToken: !!dataContext.accessToken,
        doctorId: dataContext.doctorId,
        dataContext: dataContext
    });

    // Use useEffect to handle initialization properly
    useEffect(() => {
        if (!isLoading && patients.length === 0 && !error && dataContext.accessToken && dataContext.doctorId) {
            console.log('Sending INIT_PATIENTS_PAGE event via useEffect');
            dataSend({ type: "INIT_PATIENTS_PAGE" });
        }
    }, [dataContext.accessToken, dataContext.doctorId]); // Only depend on auth data, not on loading states


    const handleRetry = () => {
        dataSend({ type: "RETRY_DOCTOR_PATIENTS" });
    };

    const handlePatientClick = (patient: Patient) => {
        doctorSend({ type: "SELECT_PATIENT", patient });
        uiSend({ type: "NAVIGATE", to: `/patient-detail` });
    };

    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.surname.toLowerCase().includes(searchTerm.toLowerCase())
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
                            <Button startIcon={<ArrowBack />} onClick={() => {uiSend({ type: "NAVIGATE", to: "/dashboard" })}} 
                            className="viewpatients-back-button" variant="outlined">
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
                        <TextField className="viewpatients-search-field" placeholder="Buscar por nombre..." value={searchTerm}
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
                                            <ListItem key={patient.id} disablePadding>
                                                <ListItemButton 
                                                    onClick={() => handlePatientClick(patient)}
                                                    className="viewpatients-patient-card"
                                                    sx={{
                                                        borderRadius: 2,
                                                        mb: 1,
                                                        border: '1px solid #e0e0e0',
                                                        '&:hover': {
                                                            backgroundColor: '#f5f5f5',
                                                            borderColor: '#2196f3'
                                                        }
                                                    }}
                                                >
                                                    <ListItemAvatar>
                                                        <Avatar className="viewpatients-patient-avatar">
                                                            {getInitials(patient.name, patient.surname)}
                                                        </Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText 
                                                        primary={
                                                            <Typography className="viewpatients-patient-name">
                                                                {getFullName(patient.name, patient.surname)}
                                                            </Typography>
                                                        }
                                                        secondary="Ver detalles del paciente"
                                                    />
                                                    <ChevronRight color="action" />
                                                </ListItemButton>
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