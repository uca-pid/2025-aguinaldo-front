import React, { useEffect } from "react";
import {
  Box, Typography, Grid, Card, CardActionArea, CardContent, List, ListItem, ListItemText, Paper, CircularProgress,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ListAltIcon from "@mui/icons-material/ListAlt";
import { styled } from "@mui/material/styles";
import { useMachines } from "#/providers/MachineProvider";
import { useAuthMachine } from "#/providers/AuthProvider";
import { SignInResponse } from "#/models/Auth";
import {LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ReservationTurns from "./ReservationTurns";
import ViewTurns from "./ViewTurns";
import dayjs from "dayjs";

const HoverCard = styled(Card)(({ theme }) => ({
  transition: "transform 0.2s, box-shadow 0.2s",
  height: "100%",
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: theme.shadows[6],
  },
}));

const PatientDashboard: React.FC = () => {
  const { ui, turn } = useMachines();
  const { auth } = useAuthMachine();
  const { send: uiSend } = ui;
  const authContext = auth.context;
  const user = auth.authResponse as SignInResponse;;
  const { state: turnState, send: turnSend } = turn;
  const turnContext = turnState.context;

  useEffect(() => {
    if (authContext.isAuthenticated && user.accessToken && user.id) {
      turnSend({
        type: "SET_AUTH",
        accessToken: user.accessToken,
        userId: user.id
      });
      
      turnSend({ type: "LOAD_MY_TURNS" });
    }
  }, [authContext.isAuthenticated, user.accessToken, user.id, turnSend]);

  const upcomingTurns = turnContext.myTurns
    .filter((turn: any) => {
      const turnDate = dayjs(turn.scheduledAt);
      const now = dayjs();
      const isUpcoming = turnDate.isAfter(now);
      
      return isUpcoming && ['RESERVED', 'SCHEDULED'].includes(turn.status);
    })
    .slice(0, 10)
    .sort((a: any, b: any) => dayjs(a.scheduledAt).diff(dayjs(b.scheduledAt)));

  const formatTurnForDisplay = (turn: any) => ({
    date: dayjs(turn.scheduledAt).format("DD/MM/YYYY"),
    time: dayjs(turn.scheduledAt).format("HH:mm"),
    doctor: turn.doctorName || "Doctor",
    profession: turn.doctorSpecialty || "Especialidad"
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        bgcolor="#ffffff"
        width="100%"
        display="flex"
        flexDirection="column"
        gap={3}
        borderRadius={3}
        alignItems="center"
      >
        <Grid container spacing={3} justifyContent="center" alignItems="stretch">
          <Grid display="flex" justifyContent="center">
            <HoverCard sx={{ width: "100%", maxWidth: 300 }}>
              <CardActionArea onClick={() => uiSend({ type: "TOGGLE", key: "showDoAReservationTurn" })} sx={{ height: "100%" }}>
                <CardContent sx={{ textAlign: "center", py: 6 }}>
                  <CalendarTodayIcon fontSize="large" color="primary" />
                  <Typography variant="h6" mt={2}>Reservar Turno</Typography>
                </CardContent>
              </CardActionArea>
            </HoverCard>
          </Grid>

          <Grid display="flex" justifyContent="center" >
            <HoverCard sx={{ width: "100%", maxWidth: 300 }}>
              <CardActionArea onClick={() => uiSend({type:"TOGGLE", key:"reservations"})} sx={{ height: "100%" }}>
                <CardContent sx={{ textAlign: "center", py: 6 }}>
                  <ListAltIcon fontSize="large" color="secondary" />
                  <Typography variant="h6" mt={2} px={2.5}>Mis Turnos</Typography>
                </CardContent>
              </CardActionArea>
            </HoverCard>
          </Grid>

          <Grid display="flex" justifyContent="center">
            <Paper elevation={3} sx={{ height: "100%", width: "100%", maxWidth: 300 }}>
              <Typography variant="h6" p={2} borderBottom="1px solid #eee" px={2.5}>
                Próximos Turnos
              </Typography>
              
              {turnContext.isLoadingMyTurns ? (
                <Box display="flex" justifyContent="center" p={4}>
                  <CircularProgress size={24} />
                </Box>
              ) : turnContext.myTurnsError ? (
                <Box p={2}>
                  <Typography variant="body2" color="error">
                    Error al cargar turnos: {turnContext.myTurnsError}
                  </Typography>
                </Box>
              ) : (
                <List sx={{ maxHeight: 200, overflowY: "auto" }}>
                  {upcomingTurns.length > 0 ? (
                    upcomingTurns.map((turn: any, index: number) => {
                      const formattedTurn = formatTurnForDisplay(turn);
                      return (
                        <ListItem key={turn.id || index} divider>
                          <ListItemText
                            primary={`${formattedTurn.date} - ${formattedTurn.time}`}
                            secondary={`${formattedTurn.doctor} - ${formattedTurn.profession}`}
                          />
                        </ListItem>
                      );
                    })
                  ) : (
                    <Box p={2}>
                      <Typography variant="body2" color="textSecondary">
                        No tenés turnos próximos
                      </Typography>
                    </Box>
                  )}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>

        <ReservationTurns/>

        <ViewTurns/>
      </Box>
    </LocalizationProvider>
  );
};

export default PatientDashboard;
