
import { Box, Divider, Grid, List, ListItem, ListItemText } from "@mui/material";

import { useAuthMachine } from "#/providers/AuthProvider";
import { SignInResponse } from "#/models/Auth";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import { useMachines } from "#/providers/MachineProvider";

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
    const { context: uiContext } = ui;
    const formContext = uiContext.toggleStates || {};
    const name= formContext["editName"] ?? false;
    const surname= formContext["editSurname"] ?? false;
    const email= formContext["editEmail"] ?? false;
    const phone= formContext["editNumberPhone"] ?? false;
    const speciality= formContext["editSpeciality"]??false;
    const minutes= formContext["editMinutes"] ?? false;
    const dni= formContext["editDni"] ?? false;
    const gender= formContext["editGender"] ?? false;
    const birthdate= formContext["editBirthdate"] ?? false;

    
    const {send: authSend } = auth;
    


 
    return (
    <Grid  container
        justifyContent="center"
        alignItems="center"
        sx={{
        maxHeight: "100vh",
        boxSizing: "border-box",
        
  }}>
        <Box
            sx={{
                mx: "4px",   
                mt:"30px",                   
                borderRadius: 2,
                boxShadow: 8,
                p: { xs: 1.5, sm: 3 },
                minWidth: { xs: "90vw", sm: 320 },
                width: { xs: "95vw", sm: 370 },
                maxWidth: "98vw",
                maxHeight: { xs: "calc(100vh - 140px)", sm: "calc(100vh - 160px)" }, 
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                overflowY: "auto",
                alignItems: "center",
                backgroundColor: "background.paper",
            }}
        >
            <AccountCircleIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />

            <List sx={{...style, width: "100%", overflow: "visible"}}>
                <EditField label="Nombre" value={user.name} isEditing={name} toggleKey="editName" onChange={(val) => authSend({ type: "UPDATE_FORM", key: "name", value: val })}/>
                <EditField label="Apellido" value={user.surname} isEditing={surname} toggleKey="editSurname" onChange={(val) => authSend({ type: "UPDATE_FORM", key: "surname", value: val })} />
                <EditField label="Email" value={user.email} isEditing={email} toggleKey="editEmail" onChange={(val) => authSend({ type: "UPDATE_FORM", key: "email", value: val })}/>
                <EditField label="Telefono" value={12345} isEditing={phone} toggleKey="editNumberPhone" onChange={(val) => authSend({ type: "UPDATE_FORM", key: "phone", value: val })}/>
                <EditField label="DNI" value={12345} isEditing={dni} toggleKey="editDni" onChange={(val) => authSend({ type: "UPDATE_FORM", key: "dni", value: val })}/>
                <EditField label="Género" value={12345} isEditing={gender} toggleKey="editGender" onChange={(val) => authSend({ type: "UPDATE_FORM", key: "gender", value: val })}/>
                <EditField label="Fecha de nacimiento" value={12345} isEditing={birthdate} toggleKey="editGender" onChange={(val) => authSend({ type: "UPDATE_FORM", key: "birthdate", value: val })}/>

                {user.role === 'DOCTOR' && (
                <>
                    <Divider component="li" />
                    <ListItem>
                    <ListItemText primary={`Matrícula Nacional: `} />
                    </ListItem>
                    <Divider component="li" />
                    <EditField label="Especialidad" value={"Psicologia"} isEditing={speciality} toggleKey="editSpeciality" onChange={(val) => authSend({ type: "UPDATE_FORM", key: "specialty", value: val })}/>
                    <EditField label="Minutos por turno" value={12} isEditing={minutes} toggleKey="editMinutes" onChange={(val) => authSend({ type: "UPDATE_FORM", key: "slotDurationMin", value: val })}/>
            
                    
                </>
                )}
            </List>
        </Box>

    </Grid>
    );
};

export default ProfileScreen;