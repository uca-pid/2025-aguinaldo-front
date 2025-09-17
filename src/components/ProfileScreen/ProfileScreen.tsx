
import { Box, Card, CardContent, Divider, List, ListItem, ListItemText, Typography } from "@mui/material";

import { useAuthMachine } from "#/providers/AuthProvider";
import { SignInResponse } from "#/models/Auth";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { motion } from "framer-motion";
import { useMachines } from "#/providers/MachineProvider";

import EditField from "./EditField";

const MotionCard = motion(Card);


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

    
    const {send: authSend} = auth;
    


 
    return (
        <Box
        sx={{
            p: { xs: 2, md: 4 },
            backgroundColor: "background.default",
            minHeight: "100vh",
        }}
        >
            <MotionCard
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                whileHover={{ scale: 1.01, boxShadow: "0px 8px 24px rgba(0,0,0,0.12)" }}
                sx={{
                maxWidth: 600,
                mx: "auto",
                borderRadius: 3,
                boxShadow: 4,
                }}
            >
                 <CardContent>
                    <Box
                    component={motion.div}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    mb: 3,
                    }}
                    >
                       <AccountCircleIcon
                        sx={{ fontSize: 90, color: "primary.main", mb: 1 }}
                        /> 
                        <Typography variant="h6" fontWeight="bold">
                        Mi Perfil
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                        Acá podes ver y editar tu información personal
                        </Typography>
                    </Box>
                    <List disablePadding>
                        <EditField label="Nombre" value={user.name} isEditing={name} toggleKey="editName" onChange={(val) => authSend({ type: "UPDATE_FORM", key: "name", value: val })}/>
                        <EditField label="Apellido" value={user.surname} isEditing={surname} toggleKey="editSurname" onChange={(val) => authSend({ type: "UPDATE_FORM", key: "surname", value: val })} />
                        <EditField label="Email" value={user.email} isEditing={email} toggleKey="editEmail" onChange={(val) => authSend({ type: "UPDATE_FORM", key: "email", value: val })}/>
                        <EditField label="Telefono" value={12345} isEditing={phone} toggleKey="editNumberPhone" onChange={(val) => authSend({ type: "UPDATE_FORM", key: "phone", value: val })}/>
                        <EditField label="DNI" value={12345} isEditing={dni} toggleKey="editDni" onChange={(val) => authSend({ type: "UPDATE_FORM", key: "dni", value: val })}/>
                        <EditField label="Género" value={12345} isEditing={gender} toggleKey="editGender" onChange={(val) => authSend({ type: "UPDATE_FORM", key: "gender", value: val })}/>
                        <EditField label="Fecha de nacimiento" value={12345} isEditing={birthdate} toggleKey="editGender" onChange={(val) => authSend({ type: "UPDATE_FORM", key: "birthdate", value: val })}/>

                        {user.role === 'DOCTOR' && (
                        <>

                            <ListItem>
                            <ListItemText primary={`Matrícula Nacional: `} />
                            </ListItem>
                            <Divider component="li" />
                            <EditField label="Especialidad" value={"Psicologia"} isEditing={speciality} toggleKey="editSpeciality" onChange={(val) => authSend({ type: "UPDATE_FORM", key: "specialty", value: val })}/>
                            <EditField label="Minutos por turno" value={12} isEditing={minutes} toggleKey="editMinutes" onChange={(val) => authSend({ type: "UPDATE_FORM", key: "slotDurationMin", value: val })}/>


                            </>
                            )}
                    </List>
                 </CardContent>
            </MotionCard> 
        </Box>





    );
};

export default ProfileScreen;