import React from "react";
import {Box, Typography, Paper,Button,Card,CardContent,useMediaQuery,useTheme,Fade,Zoom} from "@mui/material";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useAuthMachine } from "#/providers/AuthProvider";
import { SignInResponse } from "#/models/Auth";
import Logo from "#/assets/favicon.svg";
import "./PendingActivation.css";
import { getStatusMessage } from "#/utils/MachineUtils/profileMachineUtils";

const PendingActivation: React.FC = () => {
  const { authState, authSend } = useAuthMachine();
  const user = authState?.context?.authResponse as SignInResponse;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!user) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <HourglassEmptyIcon sx={{ fontSize: 60 }} />;
      case "REJECTED":
      case "SUSPENDED":
        return <ErrorOutlineIcon sx={{ fontSize: 60 }} />;
      default:
        return <CheckCircleOutlineIcon sx={{ fontSize: 60 }} />;
    }
  };

  return (
    <Box className="pending-container">
      <Fade in={true} timeout={800}>
        <Paper
          elevation={12}
          className={`pending-paper ${isMobile ? 'pending-paper--mobile' : ''}`}
        >

          {!isMobile && (
            <Zoom in={true} timeout={1000} style={{ transitionDelay: '200ms' }}>
              <Box className="pending-left-section">
                <Box className="pending-logo-container">
                  <img
                    src={Logo}
                    alt="MediBook Logo"
                    className="pending-logo"
                  />
                  <Typography variant="h3" className="pending-title-text">
                    MediBook
                  </Typography>
                </Box>
                <Typography variant="h6" color="text.secondary" className="pending-subtitle">
                  Sistema de Gestión de Turnos Médicos
                </Typography>
                <Typography variant="body1" color="text.secondary" className="pending-description">
                  Tu cuenta está siendo procesada.
                </Typography>
                
                <Zoom in={true} timeout={800} style={{ transitionDelay: '600ms' }}>
                  <Box className="pending-status-icon-container">
                    <Box className={`pending-status-icon status-${user.status.toLowerCase()}`}>
                      {getStatusIcon(user.status)}
                    </Box>
                  </Box>
                </Zoom>
              </Box>
            </Zoom>
          )}

     
          <Fade in={true} timeout={1000} style={{ transitionDelay: '400ms' }}>
            <Box className="pending-right-section">
              {isMobile && (
                <Box className="pending-mobile-header">
                  <Box className="pending-mobile-logo-container">
                    <img
                      src={Logo}
                      alt="MediBook Logo"
                      className="pending-mobile-logo"
                    />
                    <Typography variant="h4" className="pending-mobile-title-text">
                      MediBook
                    </Typography>
                  </Box>
                  <Box className={`pending-mobile-status-icon status-${user.status.toLowerCase()}`}>
                    {getStatusIcon(user.status)}
                  </Box>
                </Box>
              )}
              
              <Card elevation={0} className="pending-card">
                <CardContent className="pending-card-content">
                  <Typography
                    variant="h4"
                    className={`pending-form-title status-${user.status.toLowerCase()}`}
                  >
                    {user.status === 'PENDING' ? 'Cuenta Pendiente' : 
                     user.status === 'REJECTED' ? 'Cuenta Rechazada' :
                     user.status === 'SUSPENDED' ? 'Cuenta Suspendida' : 'Estado de Cuenta'}
                  </Typography>

                  <Box className="pending-content">
                    <Typography variant="h6" className="pending-greeting">
                      Hola, {user.name}
                    </Typography>
                    
                    <Box className={`pending-message-box status-${user.status.toLowerCase()}`}>
                      <Typography variant="body1" className="pending-message">
                        {getStatusMessage(user.status, user.role)}
                      </Typography>
                      
                      {user.status === "PENDING" && (
                        <Typography variant="body2" className="pending-submessage">
                          {user.role === "DOCTOR" 
                            ? "Un administrador revisará tu solicitud y podrás usar la aplicación una vez que sea aprobada."
                            : "Revisaremos tu solicitud cuanto antes."
                          }
                        </Typography>
                      )}
                    </Box>

                    <Button
                      variant="contained"
                      onClick={()=>{authSend({ type: "LOGOUT" });}}
                      className={`pending-logout-button status-${user.status.toLowerCase()}`}
                    >
                      Cerrar Sesión
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Fade>
        </Paper>
      </Fade>
    </Box>
  );
};

export default PendingActivation;
