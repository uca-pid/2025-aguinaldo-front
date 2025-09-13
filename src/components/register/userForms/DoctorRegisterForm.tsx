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
    
    const keys: (keyof typeof values)[] = [
      "doctor_name",
      "doctor_surname",
      "doctor_specialty",
      "doctor_medical_license",
      "doctor_gender",
      "doctor_birthdate",
      "doctor_email",
      "doctor_password",
      "doctor_password_confirm",
      "doctor_phone",
    ];
    return keys.some((key) => !values[key] || errors[key]);
  };

  return (
    <>
      <Stack spacing={2}>
        <TextField
          label="Nombre"
          name="doctor_name"
          fullWidth
          required
          onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
          error={!!registerContext.formErrors?.doctor_name}
          helperText={registerContext.formErrors?.doctor_name || ""}
        />
        <TextField
          label="Apellido"
          name="doctor_surname"
          fullWidth
          required
          onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
          error={!!registerContext.formErrors?.doctor_surname}
          helperText={registerContext.formErrors?.doctor_surname || ""}
        />
        <TextField
          label="Especialidad"
          name="doctor_specialty"
          fullWidth
          required
          onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
          error={!!registerContext.formErrors?.doctor_specialty}
          helperText={registerContext.formErrors?.doctor_specialty || ""}
        />
        <TextField
          label="Matrícula"
          name="doctor_medical_license"
          type="number"
          fullWidth
          required
          onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
          error={!!registerContext.formErrors?.doctor_medical_license}
          helperText={registerContext.formErrors?.doctor_medical_license || ""}
        />
        <FormControl
          fullWidth
          required
          error={!!registerContext.formErrors?.doctor_gender}
        >
          <InputLabel id="doctor_gender_label">Género</InputLabel>
          <Select
            labelId="doctor_gender_label"
            id="doctor_gender"
            name="doctor_gender"
            defaultValue=""
            fullWidth
            onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
          >
            <MenuItem value={"Masculino"}>Masculino</MenuItem>
            <MenuItem value={"Femenino"}>Femenino</MenuItem>
          </Select>
          <FormHelperText>
            {registerContext.formErrors?.doctor_gender}
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
                  name: "doctor_birthdate",
                },
              }}
              onChange={(date) =>
                debouncedUpdate("doctor_birthdate", date)
              }
            />
          </LocalizationProvider>
        </FormControl>
        <TextField
          label="Número de Teléfono"
          name="doctor_phone"
          type="number"
          fullWidth
          required
          onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
          error={!!registerContext.formErrors?.doctor_phone}
          helperText={registerContext.formErrors?.doctor_phone || ""}
        />
        <TextField
          label="Email"
          name="doctor_email"
          type="email"
          fullWidth
          required
          onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
          error={!!registerContext.formErrors?.doctor_email}
          helperText={registerContext.formErrors?.doctor_email || ""}
        />
        <TextField
          label="Contraseña"
          name="doctor_password"
          type="password"
          fullWidth
          required
          onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
          error={!!registerContext.formErrors?.doctor_password}
          helperText={registerContext.formErrors?.doctor_password || ""}
        />
        <TextField
          label="Confirmar Contraseña"
          name="doctor_password_confirm"
          type="password"
          fullWidth
          required
          onChange={(e) => debouncedUpdate(e.target.name, e.target.value)}
          error={!!registerContext.formErrors?.doctor_password_confirm}
          helperText={
            registerContext.formErrors?.doctor_password_confirm || ""
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
