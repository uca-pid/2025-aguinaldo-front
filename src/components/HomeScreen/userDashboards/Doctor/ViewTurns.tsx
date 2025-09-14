import { Box, Button, ListItem, ListItemText, Modal, Typography } from "@mui/material";
import { DateCalendar, LocalizationProvider } from "@mui/x-date-pickers";
import { useMachines } from "../../../../providers/MachineProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";

const upcomingAppointments = [
  {
    id: 1,
    date: "15/09/2025",
    time: "10:30",
    patient: "María López",
    reason: "Control de presión arterial"
  },
  {
    id: 2,
    date: "15/09/2025",
    time: "11:30",
    patient: "Juan Pérez",
    reason: "Seguimiento psicológico"
  },
  {
    id: 3,
    date: "16/09/2025",
    time: "09:00",
    patient:"María García",
    reason: "" 
  },
  {
    id: 4,
    date: "16/09/2025",
    time: "10:15",
    patient: "Carlos Martínez",
    reason: "Consulta por dolor de espalda"
  },
  {
    id: 5,
    date: "17/09/2025",
    time: "14:00",
    patient: "Lucía Ramírez",
    reason: "" 
  }
];


const ViewTurns: React.FC=()=>{
    const { ui } = useMachines();
        const { context: uiContext, send: uiSend } = ui;
        const formContext = uiContext.toggleStates || {};
        const reservations= formContext["showDoctorReservations"] ?? false;
    
        const {turn}= useMachines();
        const{ state: turnState, send: turnSend}= turn;
        const showTurnsReservationContext= turnState.context
    return(
        <>
        <Modal open={reservations} onClose={()=> uiSend({ type: "TOGGLE", key: "showDoctorReservations" })}>
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
                Mis reservas
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                <Box>
                    <DemoContainer components={['DateCalendar']}>
                    <DemoItem label="Fecha">
                        <DateCalendar
                        
                        value= {showTurnsReservationContext.showTurns.dateSelected}
                        onChange={(e)=>{turnSend({ type: "UPDATE_FORM_SHOW_TURNS", key: "dateSelected",value:e});}}
                        
                        />
                    </DemoItem>
                    </DemoContainer>
                </Box>
                </Box>
                <Box display="flex" justifyContent="flex-end" mt={1}>
                <Button onClick={()=>{turnSend({type:"RESET_SHOW_TURNS"}); uiSend({ type: "TOGGLE", key: "showDoctorReservations" })}} color="inherit">
                    Cancelar
                </Button>
                </Box>
        
            {showTurnsReservationContext.showTurns.dateSelected && (
                <>
                <Typography variant="h6" mb={1}>
                    Turnos del{" "}
                    {showTurnsReservationContext.showTurns.dateSelected.format(
                    "DD/MM/YYYY"
                    )}
                </Typography>
                {upcomingAppointments
                    .filter(
                    (appt) =>
                        appt.date ===
                        showTurnsReservationContext.showTurns.dateSelected?.format(
                        "DD/MM/YYYY"
                        )
                    )
                    .map((appt) => (
                    <ListItem key={appt.id} divider>
                        <ListItemText
                        primary={`${appt.time}`}
                        secondary={
                            <>
                            Paciente: {appt.patient} <br />
                            {appt.reason && (
                                <>
                                Motivo: {appt.reason}
                                </>
                            )}
                            </>
                        }
                        />
                        <Button variant="contained" size="small">
                        Cancelar
                        </Button>
                    </ListItem>
                    ))}

                {upcomingAppointments.filter(
                    (appt) =>
                    appt.date ===
                    showTurnsReservationContext.showTurns.dateSelected?.format(
                        "DD/MM/YYYY"
                    )
                ).length === 0 && (
                    <Typography variant="body2">
                    No tenés turnos en esta fecha
                    </Typography>
                )}
                </>
            )}
            </Box>
            </LocalizationProvider>
        </Modal>
    </>)
}
export default ViewTurns