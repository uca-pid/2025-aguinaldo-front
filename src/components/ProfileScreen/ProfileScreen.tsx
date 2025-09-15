
import { Box, Divider, Grid, IconButton, List, ListItem, ListItemText, TextField, ToggleButton } from "@mui/material";

import { useAuthMachine } from "#/providers/AuthProvider";
import { SignInResponse } from "#/models/Auth";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EditIcon from '@mui/icons-material/Edit';
import { useMachines } from "#/providers/MachineProvider";
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditField from "./EditField";

const style = {
  py: 0,
  width: '100%',
  maxWidth: 360,
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'divider',
  backgroundColor: 'background.paper',
  
};

const ProfileScreen: React.FC = () => {
    

    const { auth } = useAuthMachine();
    const user = auth.authResponse as SignInResponse;
    
    const {ui}= useMachines()
    const { context: uiContext, send: uiSend } = ui;
    const formContext = uiContext.toggleStates || {};
    const name= formContext["editName"] ?? false;
    const surname= formContext["editSurname"] ?? false;
    const email= formContext["editEmail"] ?? false;
    const phone= formContext["editNumberPhone"] ?? false;

    const numberDoctor= formContext["editNumberDoctor"] ?? false;
    const speciality= formContext["editSpeciality"]??false;
    const minutes= formContext["editMinutes"] ?? false;
    


 
    return (
    <Grid>
        <Box
  sx={{
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
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
    alignItems: "center", // <- esto centra el contenido horizontalmente
  }}
>
  <AccountCircleIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />

  <List sx={style}>
    <EditField label="Nombre" value={user.name} isEditing={name} toggleKey="editName"/>
    <EditField label="Apellido" value={user.surname} isEditing={surname} toggleKey="editSurname"/>
    <EditField label="Email" value={user.email} isEditing={email} toggleKey="editEmail"/>
    <EditField label="Telefono" value={12345} isEditing={phone} toggleKey="editNumberPhone"/>
   

    {user.role === 'DOCTOR' && (
      <>
        <Divider component="li" />
        <ListItem>
          <ListItemText primary={`Matrícula Nacional: `} />
        </ListItem>
        <Divider component="li" />
        <EditField label="Especialidad" value={"Psicologia"} isEditing={speciality} toggleKey="editSpeciality"/>
        <EditField label="Minutos por turno" value={12} isEditing={minutes} toggleKey="editMinutes"/>
   
        
      </>
    )}
  </List>
</Box>

    </Grid>
    );
};

export default ProfileScreen;