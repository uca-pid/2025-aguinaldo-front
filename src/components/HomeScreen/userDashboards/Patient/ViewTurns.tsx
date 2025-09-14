import { Box, Button, ListItem, ListItemText, Modal, Typography } from "@mui/material";
import { useMachines } from "../../../../providers/MachineProvider";
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";
import { DateCalendar } from "@mui/x-date-pickers";


const upcomingAppointments = [
  { date: "15/09/2025", time: "08:30", doctor: "Dra. Martínez", profession: "Médico" },
  { date: "15/09/2025", time: "09:15", doctor: "Dr. García", profession: "Nutricionista" },
  { date: "15/09/2025", time: "11:45", doctor: "Dra. Pérez", profession: "Psicólogo" },
  { date: "16/09/2025", time: "10:00", doctor: "Dr. Rodríguez", profession: "Médico" },
  { date: "16/09/2025", time: "13:30", doctor: "Dra. Gómez", profession: "Nutricionista" },
  { date: "17/09/2025", time: "09:00", doctor: "Dr. Ruiz", profession: "Psicólogo" },
  { date: "17/09/2025", time: "14:00", doctor: "Dr. López", profession: "Médico" },
  { date: "18/09/2025", time: "15:15", doctor: "Dra. Fernández", profession: "Psicólogo" },
  { date: "18/09/2025", time: "17:00", doctor: "Dr. Gómez", profession: "Nutricionista" },
  { date: "20/09/2025", time: "11:00", doctor: "Dra. Sánchez", profession: "Médico" },
];

const ViewTurns: React.FC = () => {
    const { ui } = useMachines();
    const { context: uiContext, send: uiSend } = ui;
    const formContext = uiContext.toggleStates || {};
    const reservations= formContext["reservations"] ?? false;

    const {showTurnsReservation}= useMachines();
    const{ context: showTurnsReservationContext, send: showTurnsReservationSend}= showTurnsReservation;
    

    return(
      <>
        <Modal open={reservations} onClose={()=> uiSend({ type: "TOGGLE", key: "reservations" })}>
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
                        
                        value= {showTurnsReservationContext.formValues.dateSelected}
                        onChange={(e)=>{showTurnsReservationSend({ type: "UPDATE_FORM", key: "dateSelected",value:e});}}
                      
                      />
                    </DemoItem>
                  </DemoContainer>
                </Box>
              </Box>
              <Box display="flex" justifyContent="flex-end" mt={1}>
                <Button onClick={()=>{showTurnsReservationSend({type:"RESET"}); uiSend({ type: "TOGGLE", key: "reservations" })}} color="inherit">
                  Cancelar
                </Button>
              </Box>
       
            {showTurnsReservationContext.formValues.dateSelected && (
              <>
                 <Typography variant="h6" mb={1}>
                   Turnos del {showTurnsReservationContext.formValues.dateSelected.format("DD/MM/YYYY")}
                </Typography>
                {upcomingAppointments
                  .filter(
                    (appt) =>
                      appt.date === showTurnsReservationContext.formValues.dateSelected?.format("DD/MM/YYYY")
                  )
                  .map((appt, index) => (
                    <ListItem key={index} divider>
                      <ListItemText
                        primary={`${appt.time}`}
                        secondary={`Con ${appt.doctor}`}
                      />
                      <Button variant="contained" size="small">Cancelar</Button>
                    </ListItem>
                  ))}

                {upcomingAppointments.filter(
                  (appt) =>
                    appt.date === showTurnsReservationContext.formValues.dateSelected?.format("DD/MM/YYYY")
                ).length === 0 && (
                  <Typography variant="body2">No tenés turnos en esta fecha</Typography>
                )}
                
              
              </>
            )}
          </Box>
        </Modal>
      </>
  );
}
export default ViewTurns