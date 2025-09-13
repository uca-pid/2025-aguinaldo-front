import React from "react";
import { useDebouncedCallback } from "use-debounce";
import {
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Button,
} from "@mui/material";
import { useMachines } from "../../../providers/MachineProvider";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/es";

const PatientRegisterForm: React.FC = () => {
  const { register } = useMachines();
  const { context: registerContext, send: registerSend } = register;

  const debouncedUpdate = useDebouncedCallback((key: string, value: any) => {
    registerSend({ type: "UPDATE_FORM", key, value });
  }, 250);

  const hasErrorsOrEmpty = () => {
    const values = registerContext.formValues || {};
    const errors = registerContext.formErrors || {};

    const keys: (keyof typeof values)[] = [
      "patient_name",
      "patient_surname",
      "patient_dni",
      "patient_gender",
      "patient_birthdate",
      "patient_email",
      "patient_password",
      "patient_password_confirm",
      "patient_phone",
    ];

    return keys.some((key) => !values[key] || errors[key]);
  };

  return (
    <>
      <Stack spacing={2}>
        <TextField
          label="Nombre"
          name="patient_name"
          fullWidth
          required
          onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
          error={!!registerContext.formErrors?.patient_name}
          helperText={registerContext.formErrors?.patient_name || ""}
        />
        <TextField
          label="Apellido"
          name="patient_surname"
          fullWidth
          required
          onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
          error={!!registerContext.formErrors?.patient_surname}
          helperText={registerContext.formErrors?.patient_surname || ""}
        />
        <TextField
          label="DNI"
          name="patient_dni"
          type="number"
          fullWidth
          required
          onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
          error={!!registerContext.formErrors?.patient_dni}
          helperText={registerContext.formErrors?.patient_dni || ""}
        />
        <FormControl
          fullWidth
          required
          error={!!registerContext.formErrors?.patient_gender}
        >
          <InputLabel id="genero-patient-label">Género</InputLabel>
          <Select
            labelId="genero-patient-label"
            id="genero-patient"
            name="patient_gender"
            defaultValue=""
            fullWidth
            onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
          >
            <MenuItem value={"Masculino"}>Masculino</MenuItem>
            <MenuItem value={"Femenino"}>Femenino</MenuItem>
          </Select>
          <FormHelperText>
            {registerContext.formErrors?.patient_gender}
          </FormHelperText>
        </FormControl>
        <FormControl fullWidth required>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
            <DatePicker
              label="Fecha de Nacimiento"
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  required: true,
                  fullWidth: true,
                  name: "patient_birthdate",
                },
              }}
              onChange={(date) =>
                debouncedUpdate("patient_birthdate", date)
              }
            />
          </LocalizationProvider>
        </FormControl>
        <TextField
          label="Número de Teléfono"
          name="patient_phone"
          type="number"
          fullWidth
          required
          onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
          error={!!registerContext.formErrors?.patient_phone}
          helperText={registerContext.formErrors?.patient_phone || ""}
        />
        <TextField
          label="Email"
          name="patient_email"
          type="email"
          fullWidth
          required
          onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
          error={!!registerContext.formErrors?.patient_email}
          helperText={registerContext.formErrors?.patient_email || ""}
        />
        <TextField
          label="Contraseña"
          name="patient_password"
          type="password"
          fullWidth
          required
          onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
          error={!!registerContext.formErrors?.patient_password}
          helperText={registerContext.formErrors?.patient_password || ""}
        />
        <TextField
          label="Confirmar Contraseña"
          name="patient_password_confirm"
          type="password"
          fullWidth
          required
          onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
          error={!!registerContext.formErrors?.patient_password_confirm}
          helperText={
            registerContext.formErrors?.patient_password_confirm || ""
          }
        />
      </Stack>

      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 4 }}
        onClick={() => registerSend({ type: "SUBMIT" })}
        disabled={hasErrorsOrEmpty()}
      >
        Enviar
      </Button>
    </>
  );
};

export default PatientRegisterForm;
