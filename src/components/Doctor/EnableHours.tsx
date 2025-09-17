import { 
  Avatar, 
  Box, 
  Button, 
  Typography,
  Container
} from "@mui/material"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { MultiInputDateRangeField } from "@mui/x-date-pickers-pro/MultiInputDateRangeField"
import { MultiInputTimeRangeField } from "@mui/x-date-pickers-pro/MultiInputTimeRangeField"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { CalendarMonthOutlined, AccessTimeOutlined, ArrowBack } from '@mui/icons-material'
import { useMachines } from "#/providers/MachineProvider"
import './EnableHours.css'

const EnableHours: React.FC = () => {
    const { ui } = useMachines();
    const { send: uiSend } = ui;
    
    const handleBack = () => {
        uiSend({ type: "NAVIGATE", to: "/dashboard" });
    };
    
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box className="enablehours-page-container">
                <Container maxWidth="lg">
                    <Box className="enablehours-page-header">
                        <Button
                            startIcon={<ArrowBack />}
                            onClick={handleBack}
                            className="enablehours-back-button"
                            variant="outlined"
                        >
                            Volver al Dashboard
                        </Button>
                        
                        <Box className="enablehours-header">
                            <Avatar className="enablehours-header-icon">
                                <CalendarMonthOutlined />
                            </Avatar>
                            <Box className="enablehours-header-content">
                                <Typography variant="h4" className="enablehours-header-title">
                                    Configurar Horarios Disponibles
                                </Typography>
                                <Typography variant="h6" className="enablehours-header-subtitle">
                                    Establece los días y horarios para tus consultas médicas
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Box className="enablehours-content">
                        <Box className="enablehours-form-section">
                            <Box className="enablehours-field-group">
                                <Typography variant="h6" className="enablehours-field-title">
                                    <CalendarMonthOutlined />
                                    Rango de Fechas
                                </Typography>
                                <Typography variant="body2" className="enablehours-field-subtitle">
                                    Selecciona el período durante el cual estarás disponible
                                </Typography>
                                <MultiInputDateRangeField
                                    className="enablehours-date-range-field"
                                    slotProps={{
                                        textField: ({ position }) => ({
                                            label: position === 'start' ? 'Fecha de Inicio' : 'Fecha de Fin',
                                            fullWidth: true,
                                        }),
                                    }}
                                />
                            </Box>

                            <Box className="enablehours-field-group">
                                <Typography variant="h6" className="enablehours-field-title">
                                    <AccessTimeOutlined />
                                    Horario de Atención
                                </Typography>
                                <Typography variant="body2" className="enablehours-field-subtitle">
                                    Define el horario diario en el que atenderás pacientes
                                </Typography>
                                <MultiInputTimeRangeField
                                    className="enablehours-time-range-field"
                                    slotProps={{
                                        textField: ({ position }) => ({
                                            label: position === 'start' ? 'Hora de Inicio' : 'Hora de Fin',
                                            fullWidth: true,
                                        }),
                                    }}
                                />
                            </Box>
                        </Box>

                        <Box className="enablehours-help-text">
                            <Typography variant="body2">
                                💡 Los turnos se generarán automáticamente en intervalos de 30 minutos dentro del horario configurado
                            </Typography>
                        </Box>
                    </Box>

                    <Box className="enablehours-actions">
                        <Button 
                            onClick={handleBack} 
                            variant="outlined"
                            className="enablehours-btn-cancel"
                        >
                            Cancelar
                        </Button>
                        <Button 
                            onClick={handleBack} 
                            variant="contained"
                            className="enablehours-btn-submit"
                        >
                            Guardar Horarios
                        </Button>
                    </Box>
                </Container>
            </Box>
        </LocalizationProvider>
    )
}

export default EnableHours