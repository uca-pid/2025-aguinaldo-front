import React, { useState } from "react";
import {
  Box, Typography, Grid, Card, CardActionArea, CardContent, List, ListItem, ListItemText, Paper, Modal, TextField, Button,
  FormControl, InputLabel, Select, MenuItem, FormHelperText, SelectChangeEvent
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ListAltIcon from "@mui/icons-material/ListAlt";
import { styled } from "@mui/material/styles";
import { useMachines } from "../../../providers/MachineProvider";
import { useMachine } from "@xstate/react";
import { takeTurnPacientMachine } from "../../../machines/takeTurnPacientMachine";
import { DigitalClock, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';

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

const professions = [
  { value: "medico", label: "Médico" },
  { value: "psicologo", label: "Psicólogo" },
  { value: "nutricionista", label: "Nutricionista" },
];

const professionals = [
  { value: 1, label: "Fernandez, Victoria", profession: "medico" },
  { value: 2, label: "Lopez, Matías", profession: "psicologo" },
  { value: 3, label: "García, Sol", profession: "nutricionista" },
  { value: 4, label: "Martínez, Juan", profession: "medico" },
  { value: 5, label: "Pérez, Ana", profession: "psicologo" },
];

const PatientDashboard: React.FC = () => {
  const { ui } = useMachines();
  const { context: uiContext, send: uiSend } = ui;
  const formContext = uiContext.toggleStates || {};
  const reserveTurns = formContext["showReservedTurns"] ?? false;
  const [state, send] = useMachine(takeTurnPacientMachine);
  const formValues = state.context.formValues;


  const [step, setStep] = useState(0);

  
  const isProfessionSelected = !!state.context.formValues.professionSelected;

 
  const filteredProfessionals = isProfessionSelected
    ? professionals.filter((p) => p.profession === formValues.professionSelected)
    : [];


  const handleReasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    send({ type: "UPDATE_FORM", key: "reason", value: e.target.value });
  };
 
  const handleProfessionChange = (event: SelectChangeEvent) => {
   
    send({ type: "UPDATE_FORM", key: "professionSelected", value: event.target.value });
  };

  const handleProfessionalChange = (event: SelectChangeEvent) => {
    send({ type: "UPDATE_FORM", key: "profesionalSelected", value: event.target.value });
  };
  const handleDateChange = (newValue: Dayjs | null) => {
    send({ type: "UPDATE_FORM", key: "dateSelected", value: newValue });
    send({ type: "UPDATE_FORM", key: "timeSelected", value: null });
  };
  const handleTimeChange = (newTime: any) => {
    send({ type: "UPDATE_FORM", key: "timeSelected", value: newTime });
  };


 
  const handleClose = () => {
    uiSend({ type: "TOGGLE", key: "showReservedTurns" });
    setStep(0);
    send({ type: "UPDATE_FORM", key: "reason", value: "" });
    send({ type: "UPDATE_FORM", key: "profesionalSelected", value: "" });
    send({ type: "UPDATE_FORM", key: "dateSelected", value: null });
    send({ type: "UPDATE_FORM", key: "timeSelected", value: null });
  };

  const handleReserve = () => {
    uiSend({ type: "TOGGLE", key: "showReservedTurns" });
    setStep(0);
    send({ type: "UPDATE_FORM", key: "reason", value: "" });
    send({ type: "UPDATE_FORM", key: "profesionalSelected", value: "" });
    send({ type: "UPDATE_FORM", key: "dateSelected", value: null });
    send({ type: "UPDATE_FORM", key: "timeSelected", value: null });
  };

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
              <CardActionArea onClick={() => uiSend({ type: "TOGGLE", key: "showReservedTurns" })} sx={{ height: "100%" }}>
                <CardContent sx={{ textAlign: "center", py: 6 }}>
                  <CalendarTodayIcon fontSize="large" color="primary" />
                  <Typography variant="h6" mt={2}>Reservar Turno</Typography>
                </CardContent>
              </CardActionArea>
            </HoverCard>
          </Grid>

          <Grid display="flex" justifyContent="center" >
            <HoverCard sx={{ width: "100%", maxWidth: 300 }}>
              <CardActionArea onClick={() => alert("Ir a Mis Turnos")} sx={{ height: "100%" }}>
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
        <Modal open={reserveTurns} onClose={handleClose}>
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
            {step === 0 && (
              <>
                <Typography variant="h6" mb={1}>
                  Reservar Turno
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  <TextField
                    label="Motivo de la consulta"
                    value={formValues.reason}
                    onChange={handleReasonChange}
                    fullWidth
                    size="small"
                  />
                  <FormControl required size="small" fullWidth>
                    <InputLabel id="profesion-select-label">Profesión</InputLabel>
                    <Select
                      labelId="profesion-select-label"
                      id="profesion-select"
                      value={formValues.professionSelected}
                      label="Profesión *"
                      onChange={handleProfessionChange}
                    >
                      <MenuItem value="">
                        <em>Seleccione una profesión</em>
                      </MenuItem>
                      {professions.map((prof) => (
                        <MenuItem key={prof.value} value={prof.value}>
                          {prof.label}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>Required</FormHelperText>
                  </FormControl>
                  <FormControl required size="small" fullWidth>
                    <InputLabel id="profesional-select-label">Profesional</InputLabel>
                    <Select
                      labelId="profesional-select-label"
                      id="profesional-select"
                      value={formValues.profesionalSelected}
                      label="Profesional *"
                      onChange={handleProfessionalChange}
                      disabled={!isProfessionSelected}
                    >
                      <MenuItem value="">
                        <em>Seleccione un profesional</em>
                      </MenuItem>
                      {filteredProfessionals.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>Required</FormHelperText>
                  </FormControl>
                  <Box>
                    <DemoContainer components={['DateCalendar']}>
                      <DemoItem label="Fecha">
                        <DateCalendar
                          value={formValues.dateSelected}
                          onChange={handleDateChange}
                        />
                      </DemoItem>
                    </DemoContainer>
                  </Box>
                </Box>
                <Box display="flex" justifyContent="flex-end" mt={1}>
                  <Button onClick={handleClose} color="inherit">
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => setStep(1)}
                    variant="contained"
                    color="primary"
                    disabled={
                      !isProfessionSelected ||
                      !formValues.profesionalSelected ||
                      !formValues.dateSelected
                    }
                  >
                    Siguiente
                  </Button>
                </Box>
              </>
            )}
            {step === 1 && (
              <>
                <Typography variant="h6" mb={1}>
                  Seleccioná la hora
                </Typography>
                <Box mb={2}>
                  <DemoItem label="Hora">
                    <DigitalClock
                      value={formValues.timeSelected ?? null}
                      onChange={handleTimeChange}
                    />
                  </DemoItem>
                </Box>
                <Box display="flex" justifyContent="flex-end">
                  <Button onClick={() => setStep(0)} color="inherit">
                    Atrás
                  </Button>
                  <Button
                    onClick={handleReserve}
                    variant="contained"
                    color="primary"
                    disabled={!formValues.timeSelected}
                  >
                    Reservar
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Modal>
      </Box>
    </LocalizationProvider>
  );
};

export default PatientDashboard;
