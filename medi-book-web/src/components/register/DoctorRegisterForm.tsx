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

const DoctorRegisterForm: React.FC<Props> = ({ registerState, registerSend }) => {
  const debouncedUpdate = useDebouncedCallback((key: string, value: any) => {
    registerSend({ type: "UPDATE_FORM", key, value });
  }, 250);

  const hasErrorsOrEmpty = () => {
    const values = registerState.context.formValues || {};
    const errors = registerState.context.formErrors || {};
    const keys = [
      "doctorNombre",
      "doctorApellido",
      "doctorEspecialidad",
      "doctorMatricula",
      "doctorGenero",
      "doctorFechaNacimiento",
      "doctorEmail",
      "doctorPassword",
      "doctorPasswordConfirm",
      "doctorTelefono",
    ];
    return keys.some((key) => !values[key] || errors[key]);
  };

  return (
    <>
      <Stack spacing={2}>
        <TextField
          label="Nombre"
          name="doctorNombre"
          fullWidth
          required
          onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
          error={!!registerState.context.formErrors?.doctorNombre}
          helperText={registerState.context.formErrors?.doctorNombre || ""}
        />
        <TextField
          label="Apellido"
          name="doctorApellido"
          fullWidth
          required
          onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
          error={!!registerState.context.formErrors?.doctorApellido}
          helperText={registerState.context.formErrors?.doctorApellido || ""}
        />
        <TextField
          label="Especialidad"
          name="doctorEspecialidad"
          fullWidth
          required
          onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
          error={!!registerState.context.formErrors?.doctorEspecialidad}
          helperText={registerState.context.formErrors?.doctorEspecialidad || ""}
        />
        <TextField
          label="Matrícula"
          name="doctorMatricula"
          type="number"
          fullWidth
          required
          onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
          error={!!registerState.context.formErrors?.doctorMatricula}
          helperText={registerState.context.formErrors?.doctorMatricula || ""}
        />
        <FormControl
          fullWidth
          required
          error={!!registerState.context.formErrors?.doctorGenero}
        >
          <InputLabel id="genero-doctor-label">Género</InputLabel>
          <Select
            labelId="genero-doctor-label"
            id="genero-doctor"
            name="doctorGenero"
            defaultValue=""
            fullWidth
            onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
          >
            <MenuItem value={"Masculino"}>Masculino</MenuItem>
            <MenuItem value={"Femenino"}>Femenino</MenuItem>
          </Select>
          <FormHelperText>
            {registerState.context.formErrors?.doctorGenero}
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
                  name: "doctorFechaNacimiento",
                },
              }}
              onChange={(date) =>
                debouncedUpdate("doctorFechaNacimiento", date)
              }
            />
          </LocalizationProvider>
        </FormControl>
        <TextField
          label="Número de Teléfono"
          name="doctorTelefono"
          type="number"
          fullWidth
          required
          onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
          error={!!registerState.context.formErrors?.doctorTelefono}
          helperText={registerState.context.formErrors?.doctorTelefono || ""}
        />
        <TextField
          label="Email"
          name="doctorEmail"
          type="email"
          fullWidth
          required
          onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
          error={!!registerState.context.formErrors?.doctorEmail}
          helperText={registerState.context.formErrors?.doctorEmail || ""}
        />
        <TextField
          label="Contraseña"
          name="doctorPassword"
          type="password"
          fullWidth
          required
          onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
          error={!!registerState.context.formErrors?.doctorPassword}
          helperText={registerState.context.formErrors?.doctorPassword || ""}
        />
        <TextField
          label="Confirmar Contraseña"
          name="doctorPasswordConfirm"
          type="password"
          fullWidth
          required
          onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
          error={!!registerState.context.formErrors?.doctorPasswordConfirm}
          helperText={
            registerState.context.formErrors?.doctorPasswordConfirm || ""
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

export default DoctorRegisterForm;
