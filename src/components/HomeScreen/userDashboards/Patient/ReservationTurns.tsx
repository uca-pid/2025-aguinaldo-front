import { Box, Button, FormControl, FormHelperText, InputLabel, MenuItem, Modal, Select, SelectChangeEvent, TextField, Typography } from "@mui/material";
import React from "react";
import { useMachines } from "../../../../providers/MachineProvider";
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";
import { DateCalendar, DigitalClock } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";


const ReservationTurns: React.FC = () => {
  const { ui } = useMachines();
  const { context: uiContext, send: uiSend } = ui;
  const formContext = uiContext.toggleStates || {}
  const reserveTurns = formContext["showDoAReservationTurn"] ?? false;
    
  const {turn}= useMachines();
  const{state: turnState, send: turnSend}= turn;
  const turnContext=turnState.context;
  const formValues= turnContext.takeTurn;

  const isProfessionSelected = !!formValues.professionSelected;

  const currentStep=turnState.value.takeTurn;

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

  const filteredProfessionals = isProfessionSelected
    ? professionals.filter((p) => p.profession === formValues.professionSelected)
    : [];


  const handleClose = () => {
    uiSend({ type: "TOGGLE", key: "showDoAReservationTurn" });
    turnSend({ type: "UPDATE_FORM_TAKE_TURN", key: "reason", value: "" });
    turnSend({ type: "UPDATE_FORM_TAKE_TURN", key: "professionSelected", value: "" });
    turnSend({ type: "UPDATE_FORM_TAKE_TURN", key: "profesionalSelected", value: "" });
    turnSend({ type: "UPDATE_FORM_TAKE_TURN", key: "dateSelected", value: null });
    turnSend({ type: "UPDATE_FORM_TAKE_TURN", key: "timeSelected", value: null });
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    turnSend({ type: "UPDATE_FORM_TAKE_TURN", key: "reason", value: e.target.value });
  };    

  const handleProfessionChange = (event: SelectChangeEvent) => {
    turnSend({ type: "UPDATE_FORM_TAKE_TURN", key: "professionSelected", value: event.target.value });
  };
  
  const handleProfessionalChange = (event: SelectChangeEvent) => {
      turnSend({ type: "UPDATE_FORM_TAKE_TURN", key: "profesionalSelected", value: event.target.value });
  };

  const handleDateChange = (newValue: Dayjs | null) => {
      turnSend({ type: "UPDATE_FORM_TAKE_TURN", key: "dateSelected", value: newValue });
      turnSend({ type: "UPDATE_FORM_TAKE_TURN", key: "timeSelected", value: null });
  };

  const handleTimeChange = (newTime: any) => {
     turnSend({ type: "UPDATE_FORM_TAKE_TURN", key: "timeSelected", value: newTime });
  };

  const handleReserve = () => {
    uiSend({ type: "TOGGLE", key: "showDoAReservationTurn" });
     turnSend({ type: "RESET_TAKE_TURN" });
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
          {currentStep==="step1" && (
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
                  onClick={() =>  turnSend({ type: "NEXT" })}
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
          {currentStep==="step2" && (
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
                <Button onClick={() =>  turnSend({ type: "BACK" })} color="inherit">
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

      </>
  );
}
export default ReservationTurns;