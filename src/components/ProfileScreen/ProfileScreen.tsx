
import { Box, Button, Card, CardContent, Divider, List, ListItem, ListItemText, Typography } from "@mui/material";

import { useAuthMachine } from "#/providers/AuthProvider";
import { SignInResponse } from "#/models/Auth";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { motion } from "framer-motion";
import { useMachines } from "#/providers/MachineProvider";

import EditField from "./EditField";
import { useEffect } from "react";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
const MotionCard = motion(Card);


const ProfileScreen: React.FC = () => {
    

    const { auth } = useAuthMachine();
    const { context: authContext, send: authSend } = auth;
    const user = auth.authResponse as SignInResponse;
    
    const profile = authContext.profile;

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

    
;
    
    useEffect(() => {
    if (user?.accessToken && user?.id) {
      authSend({ type: "SAVE_PROFILE" });
    }
    }, [user, authSend]);

 
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
                    {!profile ? (
                    <Typography align="center" color="text.secondary">
                    Cargando perfil...
                    </Typography>
                    ) : (
                        <List disablePadding>
                            <EditField label="Nombre" value={profile.name} isEditing={name} toggleKey="editName" fieldKey="name" onChange={(val) => authSend({ type: "UPDATE_FORM", key: "name", value: val })}/>
                            <EditField label="Apellido" value={profile.surname} isEditing={surname} toggleKey="editSurname" fieldKey="surname" onChange={(val) => authSend({ type: "UPDATE_FORM", key: "surname", value: val })} />
                            <EditField label="Email" value={profile.email} isEditing={email} toggleKey="editEmail" fieldKey="email" onChange={(val) => authSend({ type: "UPDATE_FORM", key: "email", value: val })}/>
                            <EditField label="Telefono" value={profile.phone} isEditing={phone} toggleKey="editNumberPhone" fieldKey="phone" onChange={(val) => authSend({ type: "UPDATE_FORM", key: "phone", value: val })}/>
                            <EditField label="DNI" value={profile.dni} isEditing={dni} toggleKey="editDni" fieldKey="dni" onChange={(val) => authSend({ type: "UPDATE_FORM", key: "dni", value: val })}/>
                            <EditField label="Género" value={profile.gender} isEditing={gender} toggleKey="editGender" fieldKey="gender" onChange={(val) => authSend({ type: "UPDATE_FORM", key: "gender", value: val })}/>
                            <EditField label="Fecha de nacimiento" value={profile.birthdate} isEditing={birthdate} toggleKey="editBirthdate" fieldKey="birthdate" onChange={(val) => authSend({ type: "UPDATE_FORM", key: "birthdate", value: val })}/>

                            {user.role === 'DOCTOR' && (
                            <>

                                <ListItem>
                                <ListItemText primary={`Matrícula Nacional: `} />
                                </ListItem>
                                <Divider component="li" />
                                <EditField label="Especialidad" value={profile.specialty} isEditing={speciality} toggleKey="editSpeciality" fieldKey="specialty" onChange={(val) => authSend({ type: "UPDATE_FORM", key: "specialty", value: val })}/>
                                <EditField label="Minutos por turno" value={profile.slotDurationMin} isEditing={minutes} toggleKey="editMinutes" fieldKey="slotDurationMin" onChange={(val) => authSend({ type: "UPDATE_FORM", key: "slotDurationMin", value: val })}/>


                                </>
                                )}

                            <Box
                            component={motion.div}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}
                            >
                            <Button
                            variant="contained"
                            color="error"
                            startIcon={<DeleteForeverIcon />}
                            sx={{
                                borderRadius: 2,
                                px: 4,
                                py: 1.5,
                                textTransform: 'none',
                                fontWeight: 'bold',
                                boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                transform: 'scale(1.05)',
                                boxShadow: '0px 6px 16px rgba(0,0,0,0.15)',
                                },
                            }}
                            onClick={() => console.log("Dar de baja la cuenta")}
                            >
                            Dar de baja la cuenta
                            </Button>
                        </Box>
                     
                        </List>
                    
                    
                    )}
                 </CardContent>
            </MotionCard> 
        </Box>





    );
};

export default ProfileScreen;