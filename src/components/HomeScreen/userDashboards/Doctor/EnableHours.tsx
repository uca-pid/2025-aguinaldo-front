import { Box, Button, Modal, Typography } from "@mui/material"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { MultiInputDateRangeField } from "@mui/x-date-pickers-pro/MultiInputDateRangeField"
import { MultiInputTimeRangeField } from "@mui/x-date-pickers-pro/MultiInputTimeRangeField"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { useMachines } from "../../../../providers/MachineProvider"

const EnableHours:React.FC=()=>{
    const { ui } = useMachines();
    const { context: uiContext, send: uiSend } = ui;
    const formContext = uiContext.toggleStates || {};
    const reservations= formContext["enableDoctorReservations"] ?? false;
    
    return(
        <Modal open={reservations} onClose={()=> uiSend({ type: "TOGGLE", key: "enableDoctorReservations" })}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box
            sx={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                bgcolor: "background.paper",
                borderRadius: 2,
                boxShadow: 8,
                p: { xs: 1.5, sm: 3 },
                minWidth: { xs: "90vw", sm: 320 },
                width: { xs: "95vw", sm: 370 },
                maxWidth: "98vw",
                maxHeight: { xs: "95vh", sm: "90vh" },
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                overflowY: "auto",
            
            }}
            >
            
        
            <Typography variant="h6" mb={1}>
                Cargá los horarios para tus citas
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
            <Box>
                <Typography  fontSize= "1rem" variant="h5" mb={1}>
                Elegí el rango de días
                </Typography>
                <MultiInputDateRangeField
                slotProps={{
                    textField: ({ position }) => ({
                    label: position === 'start' ? 'Inicio' : 'Fin',
                    }),
                }}
                />
            </Box>
            <Box>
                <Typography fontSize= "1rem" variant="h5" mb={1}>
                Elegí el rango de horas
                </Typography>
                <MultiInputTimeRangeField
                slotProps={{
                    textField: ({ position }) => ({
                    label: position === 'start' ? 'Inicio ' : 'Fin',
                    }),
                }}
                />
            </Box>
            </Box>
            <Box display="flex" justifyContent="flex-end" mt={1}>
                <Button onClick={()=>{uiSend({ type: "TOGGLE", key: "enableDoctorReservations" })}} color="inherit">
                    Cancelar
                </Button>
                <Button onClick={()=>{uiSend({ type: "TOGGLE", key: "enableDoctorReservations" })}} color="primary">
                    CARGAR HORAS
                </Button>
            </Box>
            
            
            </Box>
            </LocalizationProvider>
        </Modal>

    )
}
export default EnableHours