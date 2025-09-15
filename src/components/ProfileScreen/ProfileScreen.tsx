
import { Box, Divider, Grid, List, ListItem, ListItemText } from "@mui/material";

import { useAuthMachine } from "#/providers/AuthProvider";
import { SignInResponse } from "#/models/Auth";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

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
    <ListItem>
      <ListItemText primary={`Nombre: ${user.name}`} />
    </ListItem>
    <Divider component="li" />
    <ListItem>
      <ListItemText primary={`Apellido: ${user.surname}`} />
    </ListItem>
    <Divider component="li" />
    <ListItem>
      <ListItemText primary={`Email: ${user.email}`} />
    </ListItem>
    <Divider component="li" />
    <ListItem>
      <ListItemText primary={`Teléfono:`} />
    </ListItem>

    {user.role === 'DOCTOR' && (
      <>
        <Divider component="li" />
        <ListItem>
          <ListItemText primary={`Matrícula Nacional: `} />
        </ListItem>
        <Divider component="li" />
        <ListItem>
          <ListItemText primary={`Especialidad: `} />
        </ListItem>
        <Divider component="li" />
        <ListItem>
          <ListItemText primary={`Minutos por turno: `} />
        </ListItem>
      </>
    )}
  </List>
</Box>

    </Grid>
    );
};

export default ProfileScreen;