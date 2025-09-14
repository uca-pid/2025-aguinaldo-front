import { Box, Button, List, ListItem, ListItemText, Modal, Typography } from "@mui/material"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { useMachines } from "../../../../providers/MachineProvider";

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

const ViewPatients: React.FC=()=>{
    const { ui } = useMachines();
    const { context: uiContext, send: uiSend } = ui;
    const formContext = uiContext.toggleStates || {}
    const patients = formContext["showPatients"] ?? false;
    
    return(
        <Modal open={patients} onClose={()=> uiSend({ type: "TOGGLE", key: "showPatients" })}>
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
                Mis pacientes
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                <Box>
                  <List>
                  {dummyPatients.map((patient) => (
                    <ListItem key={patient.id} divider>
                      <ListItemText
                        primary={patient.name}
                        secondary={
                          <>
                            Edad: {patient.age} <br />
                            DNI: {patient.dni}
                          </>
                        }
                      />
                    </ListItem>
                  ))}

                  {dummyPatients.length === 0 && (
                    <Typography variant="body2">
                      No tenés pacientes registrados
                    </Typography>
                  )}
                  </List>
                </Box>
                </Box>
                <Box display="flex" justifyContent="flex-end" mt={1}>
                <Button onClick={()=>{ uiSend({ type: "TOGGLE", key: "showPatients" })}} color="inherit">
                    Cancelar
                </Button>
                </Box>
    
            </Box>
            </LocalizationProvider>
        </Modal>

    )
}

export default ViewPatients