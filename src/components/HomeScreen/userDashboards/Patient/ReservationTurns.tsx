import { 
  Box, Button, FormControl, FormHelperText, InputLabel, MenuItem, Modal, Select, SelectChangeEvent, 
  TextField, Typography, CircularProgress, Alert, List, ListItem, ListItemButton, ListItemText 
} from "@mui/material";
import React, { useEffect } from "react";
import { useMachines } from "#/providers/MachineProvider";
import { useAuthMachine } from "#/providers/AuthProvider";
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";
import { DateCalendar } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { SignInResponse } from "#/models/Auth";

const ReservationTurns: React.FC = () => {
  const { ui, turn } = useMachines();
  const { auth } = useAuthMachine();
  const { context: uiContext, send: uiSend } = ui;
  const { context: authContext, authResponse: authResponse } = auth;
  const user = authResponse as SignInResponse
  const { state: turnState, send: turnSend } = turn;
  
  const formContext = uiContext.toggleStates || {}
  const reserveTurns = formContext["showDoAReservationTurn"] ?? false;
  const turnContext = turnState.context;
  const formValues = turnContext.takeTurn;

  const currentStep = turnState.value.takeTurn;

  useEffect(() => {
    if (reserveTurns && authContext.isAuthenticated && user.accessToken) {
      turnSend({
        type: "SET_AUTH",
        accessToken: user.accessToken,
        userId: user.id || ""
      });
      turnSend({ type: "LOAD_DOCTORS" });
    }
  }, [reserveTurns, authContext.isAuthenticated, user.accessToken, turnSend]);

  useEffect(() => {
    if (formValues.doctorId && formValues.dateSelected && user.accessToken) {
      const dateString = formValues.dateSelected.format('YYYY-MM-DD');
      turnSend({
        type: "LOAD_AVAILABLE_TURNS",
        doctorId: formValues.doctorId,
        date: dateString
      });
    }
  }, [formValues.doctorId, formValues.dateSelected, user.accessToken, turnSend]);

  const isProfessionSelected = !!formValues.professionSelected;
  const isDoctorSelected = !!formValues.doctorId;

  const specialties = Array.from(new Set(turnContext.doctors.map((doctor: any) => doctor.specialty))).map((specialty: unknown) => ({
    value: specialty as string,
    label: (specialty as string).charAt(0).toUpperCase() + (specialty as string).slice(1)
  }));

  const filteredDoctors = isProfessionSelected
    ? turnContext.doctors.filter((doctor: any) => doctor.specialty.toLowerCase() === formValues.professionSelected.toLowerCase())
    : [];

  const handleClose = () => {
    uiSend({ type: "TOGGLE", key: "showDoAReservationTurn" });
    turnSend({ type: "RESET_TAKE_TURN" });
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    turnSend({ type: "UPDATE_FORM_TAKE_TURN", key: "reason", value: e.target.value });
  };    

  const handleProfessionChange = (event: SelectChangeEvent) => {
    turnSend({ type: "UPDATE_FORM_TAKE_TURN", key: "professionSelected", value: event.target.value });
    turnSend({ type: "UPDATE_FORM_TAKE_TURN", key: "doctorId", value: "" });
    turnSend({ type: "UPDATE_FORM_TAKE_TURN", key: "profesionalSelected", value: "" });
  };
  
  const handleDoctorChange = (event: SelectChangeEvent) => {
    const selectedDoctor = turnContext.doctors.find((doctor: any) => doctor.id === event.target.value);
    turnSend({ type: "UPDATE_FORM_TAKE_TURN", key: "doctorId", value: event.target.value });
    turnSend({ type: "UPDATE_FORM_TAKE_TURN", key: "profesionalSelected", value: selectedDoctor ? `${selectedDoctor.name} ${selectedDoctor.surname}` : "" });
  };

  const handleDateChange = (newValue: Dayjs | null) => {
    turnSend({ type: "UPDATE_FORM_TAKE_TURN", key: "dateSelected", value: newValue });
    turnSend({ type: "UPDATE_FORM_TAKE_TURN", key: "timeSelected", value: null });
    turnSend({ type: "UPDATE_FORM_TAKE_TURN", key: "scheduledAt", value: null });
  };

  const handleTimeSelect = (timeSlot: string) => {
    const selectedDateTime = dayjs(timeSlot);
    turnSend({ type: "UPDATE_FORM_TAKE_TURN", key: "timeSelected", value: selectedDateTime });
    turnSend({ type: "UPDATE_FORM_TAKE_TURN", key: "scheduledAt", value: timeSlot });
  };

  const handleReserve = async () => {
    if (!formValues.scheduledAt) return;
    try {
      turnSend({ type: "CREATE_TURN" });
      
      setTimeout(() => {
        if (!turnContext.error) {
          uiSend({ type: "TOGGLE", key: "showDoAReservationTurn" });
          turnSend({ type: "RESET_TAKE_TURN" });
          turnSend({ type: "LOAD_MY_TURNS" });
        }
      }, 1000);
    } catch (error) {
      console.error('Error creating turn:', error);
    }
  };

  return(
    <>
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
          {turnContext.doctorsError && (
            <Alert severity="error">
              Error al cargar doctores: {turnContext.doctorsError}
            </Alert>
          )}
          
          {turnContext.availableError && (
            <Alert severity="error">
              Error al cargar turnos disponibles: {turnContext.availableError}
            </Alert>
          )}
          
          {turnContext.error && (
            <Alert severity="error">
              Error al crear turno: {turnContext.error}
            </Alert>
          )}

          {currentStep === "step1" && (
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
                  <InputLabel id="profession-select-label">Especialidad</InputLabel>
                  <Select
                    labelId="profession-select-label"
                    id="profession-select"
                    value={formValues.professionSelected}
                    label="Especialidad *"
                    onChange={handleProfessionChange}
                    disabled={turnContext.isLoadingDoctors}
                  >
                    <MenuItem value="">
                      <em>Seleccione una especialidad</em>
                    </MenuItem>
                    {specialties.map((specialty) => (
                      <MenuItem key={specialty.value} value={specialty.value}>
                        {specialty.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {turnContext.isLoadingDoctors && <FormHelperText>Cargando especialidades...</FormHelperText>}
                </FormControl>
                
                <FormControl required size="small" fullWidth>
                  <InputLabel id="doctor-select-label">Doctor</InputLabel>
                  <Select
                    labelId="doctor-select-label"
                    id="doctor-select"
                    value={formValues.doctorId}
                    label="Doctor *"
                    onChange={handleDoctorChange}
                    disabled={!isProfessionSelected || turnContext.isLoadingDoctors}
                  >
                    <MenuItem value="">
                      <em>Seleccione un doctor</em>
                    </MenuItem>
                    {filteredDoctors.map((doctor: any) => (
                      <MenuItem key={doctor.id} value={doctor.id}>
                        {doctor.name} {doctor.surname} - {doctor.medicalLicense}
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
                        minDate={dayjs()}
                        disabled={!isDoctorSelected}
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
                  onClick={() => turnSend({ type: "NEXT" })}
                  variant="contained"
                  color="primary"
                  disabled={
                    !isProfessionSelected ||
                    !isDoctorSelected ||
                    !formValues.dateSelected
                  }
                >
                  Siguiente
                </Button>
              </Box>
            </>
          )}
          
          {currentStep === "step2" && (
            <>
              <Typography variant="h6" mb={1}>
                Seleccioná la hora
              </Typography>
              
              {turnContext.isLoadingAvailableTurns ? (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress />
                  <Typography ml={2}>Cargando horarios disponibles...</Typography>
                </Box>
              ) : turnContext.availableTurns.length > 0 ? (
                <List sx={{ maxHeight: 300, overflowY: 'auto' }}>
                  {turnContext.availableTurns
                    .filter((timeSlot: string) => {
                      const slotDateTime = dayjs(timeSlot);
                      const now = dayjs();
                      
                      if (slotDateTime.isSame(now, 'day')) {
                        return slotDateTime.isAfter(now);
                      }
                      
                      return slotDateTime.isAfter(now, 'day');
                    })
                    .map((timeSlot: string, index: number) => (
                    <ListItem key={index} disablePadding>
                      <ListItemButton
                        selected={formValues.scheduledAt === timeSlot}
                        onClick={() => handleTimeSelect(timeSlot)}
                      >
                        <ListItemText 
                          primary={dayjs(timeSlot).format('HH:mm')}
                          secondary={dayjs(timeSlot).format('DD/MM/YYYY')}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">
                  {turnContext.availableTurns.length === 0 
                    ? "No hay horarios disponibles para la fecha seleccionada."
                    : "No hay horarios disponibles (los horarios de hoy ya han pasado)."
                  }
                </Typography>
              )}
              
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button onClick={() => turnSend({ type: "BACK" })} color="inherit">
                  Atrás
                </Button>
                <Button
                  onClick={handleReserve}
                  variant="contained"
                  color="primary"
                  disabled={!formValues.scheduledAt || turnContext.isCreatingTurn}
                >
                  {turnContext.isCreatingTurn ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Reservando...
                    </>
                  ) : (
                    'Reservar'
                  )}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </>
  );
}

export default ReservationTurns;