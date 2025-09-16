import { 
  Avatar,
  Box, 
  Button, 
  List, 
  ListItem, 
  Typography,
  TextField,
  InputAdornment,
  Container
} from "@mui/material"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { useMachines } from "#/providers/MachineProvider"
import { PeopleOutlined, SearchOutlined, PersonOutlined, BadgeOutlined, ArrowBack } from '@mui/icons-material'
import { useState } from 'react'
import './ViewPatients.css'

const dummyPatients = [
  { id: 1, name: "Juan Pérez", age: 34, dni: "12345678" },
  { id: 2, name: "María González", age: 28, dni: "23456789" },
  { id: 3, name: "Carlos López", age: 45, dni: "34567890"},
  { id: 4, name: "Ana Martínez", age: 52, dni: "45678901" },
  { id: 5, name: "Luis Fernández", age: 39, dni: "56789012" },
  { id: 6, name: "Sofía Ramírez", age: 31, dni: "67890123" },
  { id: 7, name: "Pedro Sánchez", age: 47, dni: "78901234" },
  { id: 8, name: "Laura Torres", age: 26, dni: "89012345"}
];

const ViewPatients: React.FC = () => {
    const { ui } = useMachines();
    const { send: uiSend } = ui;
    const [searchTerm, setSearchTerm] = useState('');

    const handleBack = () => {
        uiSend({ type: "NAVIGATE", to: "/dashboard" });
    };

    const filteredPatients = dummyPatients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.dni.includes(searchTerm)
    );

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };
    
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box className="viewpatients-page-container">
                <Container maxWidth="lg">
                    <Box className="viewpatients-page-header">
                        <Button
                            startIcon={<ArrowBack />}
                            onClick={handleBack}
                            className="viewpatients-back-button"
                            variant="outlined"
                        >
                            Volver al Dashboard
                        </Button>
                        
                        <Box className="viewpatients-header">
                            <Avatar className="viewpatients-header-icon">
                                <PeopleOutlined />
                            </Avatar>
                            <Box className="viewpatients-header-content">
                                <Typography variant="h4" className="viewpatients-header-title">
                                    Mis Pacientes
                                </Typography>
                                <Typography variant="h6" className="viewpatients-header-subtitle">
                                    Gestiona y consulta la información de tus pacientes
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Box className="viewpatients-content">
                        <Box className="viewpatients-search-container">
                            <TextField
                                className="viewpatients-search-field"
                                placeholder="Buscar por nombre o DNI..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchOutlined color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>

                        <Box className="viewpatients-patients-count">
                            <Typography variant="body2">
                                {filteredPatients.length} de {dummyPatients.length} paciente{dummyPatients.length !== 1 ? 's' : ''}
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
                                                    {getInitials(patient.name)}
                                                </Avatar>
                                                <Box className="viewpatients-patient-details">
                                                    <Typography className="viewpatients-patient-name">
                                                        {patient.name}
                                                    </Typography>
                                                    <Box className="viewpatients-patient-info-row">
                                                        <Typography className="viewpatients-patient-info-item">
                                                            <PersonOutlined fontSize="small" />
                                                            {patient.age} años
                                                        </Typography>
                                                        <Typography className="viewpatients-patient-info-item">
                                                            <BadgeOutlined fontSize="small" />
                                                            DNI: {patient.dni}
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
                                        : 'Los pacientes aparecerán aquí cuando se registren en el sistema'
                                    }
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Container>
            </Box>
        </LocalizationProvider>
    )
}

export default ViewPatients