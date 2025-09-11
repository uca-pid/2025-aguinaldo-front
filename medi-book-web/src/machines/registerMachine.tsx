import { createMachine, assign } from "xstate";
import dayjs from "dayjs";

export interface RegisterMachineContext {
  formValues?: Record<string, any>;
  formErrors?: Record<string, string>;
}

export type RegisterMachineEvent =
  | { type: "UPDATE_FORM"; key: string; value: any }
  | { type: "SUBMIT" }

const validateField = (key: string, value: any, context: RegisterMachineContext) => {
    switch (key) {
        // -------------------- Paciente --------------------
        case "patientNombre": return value ? "" : "Nombre requerido";
        case "patientApellido": return value ? "" : "Apellido requerido";
        case "patientDni": return /^[0-9]{7,8}$/.test(value) ? "" : "DNI inválido (7 u 8 dígitos)";
        case "patientGenero": return value ? "" : "Género requerido";
        case "patientEmail": return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "Email inválido";
        case "patientPassword": return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value)
        ? "" : "Mínimo 8 caracteres, mayúscula, minúscula y número";
        case "patientFechaNacimiento":
            if (value === null || value === undefined || value === "") return "Campo requerido";
            return dayjs(value).isValid() ? "" : "Fecha inválida";
        case "patientPasswordConfirm":
            if (!value) return "Campo requerido"; 
            return value === context.formValues?.patientPassword
                ? "" 
                : "Las contraseñas no coinciden";

        // -------------------- Doctor --------------------
        case "doctorNombre": return value ? "" : "Nombre requerido";
        case "doctorApellido": return value ? "" : "Apellido requerido";
        case "doctorEspecialidad": return value ? "" : "Especialidad requerida";
        case "doctorMatricula": return /^[0-9]{4,10}$/.test(value) ? "" : "Matrícula inválida";
        case "doctorGenero": return value ? "" : "Género requerido";
        case "doctorEmail": return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "Email inválido";
        case "doctorPassword": return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value)
        ? "" : "Mínimo 8 caracteres, mayúscula, minúscula y número";
        case "doctorFechaNacimiento":
            if (value === null || value === undefined || value === "") return "Campo requerido";
            return dayjs(value).isValid() ? "" : "Fecha inválida";
        case "doctorPasswordConfirm":
            if (!value) return "Campo requerido";
            return value === context.formValues?.doctorPassword
                ? "" 
                : "Las contraseñas no coinciden";

        default: return "";
    }
};

export const registerMachine = createMachine({
  id: "register",
  initial: "idle",
  context: {
    formValues: {
        patientNombre: "",
        patientApellido: "",
        patientDni: "",
        patientGenero: "",
        patientFechaNacimiento: null,
        patientEmail: "",
        patientPassword: "",
        patientPasswordConfirm: "",

        doctorNombre: "",
        doctorApellido: "",
        doctorEspecialidad: "",
        doctorMatricula: "",
        doctorGenero: "",
        doctorFechaNacimiento: null,
        doctorEmail: "",
        doctorPassword: "",
        doctorPasswordConfirm: "",
    },
    formErrors: {},
  },
  types: {
    context: {} as RegisterMachineContext,
    events: {} as RegisterMachineEvent,
  },
  states: {
    idle: {
      on: {
        UPDATE_FORM: {
          actions: assign({
                formValues: ({ context, event }) => ({
                    ...context.formValues,
                    [event.key]: event.value,
                }),
                formErrors: ({ context, event }) => ({
                    ...context.formErrors,
                    [event.key]: validateField(event.key, event.value, context),
                }),
            }),
        },
        
        SUBMIT: {
            target: "registered",
            actions: assign(({ context }) => {
                const errors: Record<string, string> = {};
                const formPrefix = context.formValues?.patientNombre !== undefined ? "patient" : "doctor";
                for (const [key, value] of Object.entries(context.formValues || {})) {
                    if (key.startsWith(formPrefix)) {
                        const error = validateField(key, value, context);
                        if (error) errors[key] = error;
                    }
                }

                const hasErrors = Object.keys(errors).length > 0;
                if (!hasErrors) {
                    console.log(
                        "Formulario válido, enviar datos:",
                        Object.fromEntries(
                        Object.entries(context.formValues || {}).filter(([k]) => k.startsWith(formPrefix))
                        )
                    );
                    return { ...context, formErrors: {} };
                }

                return { ...context, formErrors: errors };
            }),
        },
      },
    },
    registered: { 
        type: "final" 
    },
  },
} as const);