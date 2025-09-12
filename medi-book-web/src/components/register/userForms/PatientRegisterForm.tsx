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
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/es";

interface Props {
  registerState: any;
  registerSend: any;
}

const PatientRegisterForm: React.FC<Props> = ({ registerState, registerSend }) => {
  const debouncedUpdate = useDebouncedCallback((key: string, value: any) => {
    registerSend({ type: "UPDATE_FORM", key, value });
  }, 250);

  const hasErrorsOrEmpty = () => {
    const values = registerState.context.formValues || {};
    const errors = registerState.context.formErrors || {};
    const keys = [
      "patientNombre",
      "patientApellido",
      "patientDni",
      "patientGenero",
      "patientFechaNacimiento",
      "patientEmail",
      "patientPassword",
      "patientPasswordConfirm",
      "patientTelefono",
    ];
    return keys.some((key) => !values[key] || errors[key]);
  };

  return (
    <>
      <Stack spacing={2}>
        <TextField
          label="Nombre"
          name="patientNombre"
          fullWidth
          required
          onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
          error={!!registerState.context.formErrors?.patientNombre}
          helperText={registerState.context.formErrors?.patientNombre || ""}
        />
        <TextField
          label="Apellido"
          name="patientApellido"
          fullWidth
          required
          onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
          error={!!registerState.context.formErrors?.patientApellido}
          helperText={registerState.context.formErrors?.patientApellido || ""}
        />
        <TextField
          label="DNI"
          name="patientDni"
          type="number"
          fullWidth
          required
          onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
          error={!!registerState.context.formErrors?.patientDni}
          helperText={registerState.context.formErrors?.patientDni || ""}
        />
        <FormControl
          fullWidth
          required
          error={!!registerState.context.formErrors?.patientGenero}
        >
          <InputLabel id="genero-patient-label">Género</InputLabel>
          <Select
            labelId="genero-patient-label"
            id="genero-patient"
            name="patientGenero"
            defaultValue=""
            fullWidth
            onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
          >
            <MenuItem value={"Masculino"}>Masculino</MenuItem>
            <MenuItem value={"Femenino"}>Femenino</MenuItem>
          </Select>
          <FormHelperText>
            {registerState.context.formErrors?.patientGenero}
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
                  name: "patientFechaNacimiento",
                },
              }}
              onChange={(date) =>
                debouncedUpdate("patientFechaNacimiento", date)
              }
            />
          </LocalizationProvider>
        </FormControl>
        <TextField
          label="Número de Teléfono"
          name="patientTelefono"
          type="number"
          fullWidth
          required
          onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
          error={!!registerState.context.formErrors?.patientTelefono}
          helperText={registerState.context.formErrors?.patientTelefono || ""}
        />
        <TextField
          label="Email"
          name="patientEmail"
          type="email"
          fullWidth
          required
          onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
          error={!!registerState.context.formErrors?.patientEmail}
          helperText={registerState.context.formErrors?.patientEmail || ""}
        />
        <TextField
          label="Contraseña"
          name="patientPassword"
          type="password"
          fullWidth
          required
          onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
          error={!!registerState.context.formErrors?.patientPassword}
          helperText={registerState.context.formErrors?.patientPassword || ""}
        />
        <TextField
          label="Confirmar Contraseña"
          name="patientPasswordConfirm"
          type="password"
          fullWidth
          required
          onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
          error={!!registerState.context.formErrors?.patientPasswordConfirm}
          helperText={
            registerState.context.formErrors?.patientPasswordConfirm || ""
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
