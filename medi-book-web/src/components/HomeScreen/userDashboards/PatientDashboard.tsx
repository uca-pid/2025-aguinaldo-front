import React from "react";
import { Box, Typography, Grid, Card, CardActionArea, CardContent, List, ListItem, ListItemText, Paper, Modal, TextField, Button } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ListAltIcon from "@mui/icons-material/ListAlt";
import { styled } from "@mui/material/styles";
import { useMachines } from "../../../providers/MachineProvider";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

const upcomingAppointments = [
  { date: "15/09/2025", time: "10:30", doctor: "Dr. Pérez" },
  { date: "20/09/2025", time: "14:00", doctor: "Dra. Gómez" },
  { date: "25/09/2025", time: "09:00", doctor: "Dr. Ruiz" }
];

const HoverCard = styled(Card)(({ theme }) => ({
  transition: "transform 0.2s, box-shadow 0.2s",
  height: "100%",
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: theme.shadows[6],
  },
}));

const PatientDashboard: React.FC = () => {
  const {ui} = useMachines();
  const { context: uiContext, send: uiSend } = ui;
  const formContext = uiContext.toggleStates || {};
  const reserveTurns = formContext["showReservedTurns"] ?? false;

  const [reason, setReason] = React.useState("");
  const [date, setDate] = React.useState<Dayjs | null>(null);

  const handleMyAppointmentsClick = () => alert("Ir a Mis Turnos");

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
              <CardActionArea   onClick={() => uiSend({ type: "TOGGLE", key: "showReservedTurns" })}sx={{ height: "100%" }}>
                <CardContent sx={{ textAlign: "center", py: 6 }}>
                  <CalendarTodayIcon fontSize="large" color="primary" />
                  <Typography variant="h6" mt={2}>Reservar Turno</Typography>
                </CardContent>
              </CardActionArea>
            </HoverCard>
          </Grid>

          <Grid display="flex" justifyContent="center" >
            <HoverCard sx={{ width: "100%", maxWidth: 300 }}>
              <CardActionArea onClick={handleMyAppointmentsClick} sx={{ height: "100%" }}>
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
              <List>
                {upcomingAppointments.map((appt, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={`${appt.date} - ${appt.time}`}
                      secondary={`Con ${appt.doctor}`}
                    />
                  </ListItem>
                ))}
                {upcomingAppointments.length === 0 && (
                  <Typography variant="body2">No tenés turnos próximos</Typography>
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
        <Modal open={reserveTurns} onClose={() => uiSend({ type: "TOGGLE", key: "showReservedTurns" })}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: 8,
              p: 4,
              minWidth: 320,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography variant="h6" mb={1}>
              Reservar Turno
            </Typography>
            <TextField
              label="Motivo de la consulta"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              fullWidth
            />
            <DatePicker
              label="Fecha"
              value={date}
              onChange={setDate}
              format="DD/MM/YYYY"
              slotProps={{ textField: { fullWidth: true } }}
              minDate={dayjs()}
            />
            <Box display="flex" gap={2} justifyContent="flex-end" mt={2}>
              <Button onClick={() => uiSend({ type: "TOGGLE", key: "showReservedTurns" })} color="inherit">
                Cancelar
              </Button>
              <Button
                onClick={() => uiSend({ type: "TOGGLE", key: "showReservedTurns" })}
                variant="contained"
                color="primary"
                disabled={!reason || !date}
              >
                Reservar
              </Button>
            </Box>
          </Box>
        </Modal>
      </Box>
    </LocalizationProvider>
  );
};

export default PatientDashboard;
