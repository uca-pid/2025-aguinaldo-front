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

const DoctorRegisterForm = () => {
  const {register} = useMachines();
  const { context: registerContext, send: registerSend } = register;

  const debouncedUpdate = useDebouncedCallback((key: string, value: any) => {
    registerSend({ type: "UPDATE_FORM", key, value });
  }, 250);

  const hasErrorsOrEmpty = () => {
    const values = registerContext.formValues || {};
    const errors = registerContext.formErrors || {};
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
          error={!!registerContext.formErrors?.doctorNombre}
          helperText={registerContext.formErrors?.doctorNombre || ""}
        />
        <TextField
          label="Apellido"
          name="doctorApellido"
          fullWidth
          required
          onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
          error={!!registerContext.formErrors?.doctorApellido}
          helperText={registerContext.formErrors?.doctorApellido || ""}
        />
        <TextField
          label="Especialidad"
          name="doctorEspecialidad"
          fullWidth
          required
          onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
          error={!!registerContext.formErrors?.doctorEspecialidad}
          helperText={registerContext.formErrors?.doctorEspecialidad || ""}
        />
        <TextField
          label="Matrícula"
          name="doctorMatricula"
          type="number"
          fullWidth
          required
          onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
          error={!!registerContext.formErrors?.doctorMatricula}
          helperText={registerContext.formErrors?.doctorMatricula || ""}
        />
        <FormControl
          fullWidth
          required
          error={!!registerContext.formErrors?.doctorGenero}
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
            {registerContext.formErrors?.doctorGenero}
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
          error={!!registerContext.formErrors?.doctorTelefono}
          helperText={registerContext.formErrors?.doctorTelefono || ""}
        />
        <TextField
          label="Email"
          name="doctorEmail"
          type="email"
          fullWidth
          required
          onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
          error={!!registerContext.formErrors?.doctorEmail}
          helperText={registerContext.formErrors?.doctorEmail || ""}
        />
        <TextField
          label="Contraseña"
          name="doctorPassword"
          type="password"
          fullWidth
          required
          onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
          error={!!registerContext.formErrors?.doctorPassword}
          helperText={registerContext.formErrors?.doctorPassword || ""}
        />
        <TextField
          label="Confirmar Contraseña"
          name="doctorPasswordConfirm"
          type="password"
          fullWidth
          required
          onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
          error={!!registerContext.formErrors?.doctorPasswordConfirm}
          helperText={
            registerContext.formErrors?.doctorPasswordConfirm || ""
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
