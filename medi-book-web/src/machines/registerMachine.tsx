import { createMachine, assign } from "xstate";
import dayjs from "dayjs";

export interface RegisterMachineContext {
  formValues?: Record<string, any>;
  formErrors?: Record<string, string>;
  apiResponse?: any;
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
        case "patientTelefono":
            if (!value) return "Teléfono requerido";
            return /^\+?[0-9]{8,15}$/.test(value)
                ? ""
                : "Número de teléfono inválido (solo números, 8-15 dígitos, opcional +)";
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
        case "doctorTelefono":
            if (!value) return "Teléfono requerido";
            return /^\+?[0-9]{8,15}$/.test(value)
                ? ""
                : "Número de teléfono inválido (solo números, 8-15 dígitos, opcional +)";
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
        patientNombre: "", patientApellido: "", patientDni: "", patientGenero: "", patientFechaNacimiento: null,
        patientEmail: "",  patientPassword: "", patientPasswordConfirm: "", patientTelefono: "",
        
        doctorNombre: "", doctorApellido: "", doctorEspecialidad: "", doctorMatricula: "", doctorGenero: "", 
        doctorFechaNacimiento: null, doctorEmail: "", doctorPassword: "", doctorPasswordConfirm: "", doctorTelefono: ""
    },
    formErrors: {},
    apiResponse: null
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
                            [event.key]: event.value
                        }),
                        formErrors: ({ context, event }) => ({
                            ...context.formErrors,
                            [event.key]: validateField(event.key, event.value, context)
                        })
                    })
                },
                SUBMIT: "validating"
            }
        },
        validating: {
            always: [
                {
                    target: "submitting",
                    actions: ({ context }) => {
                        const formPrefix = context.formValues?.patientNombre ? "patient" : "doctor";
                        const errors: Record<string, string> = {};
                        for (const [key, value] of Object.entries(context.formValues || {})) {
                            if (key.startsWith(formPrefix)) {
                                const error = validateField(key, value, context);
                                if (error) errors[key] = error;
                            }
                        }
                        context.formErrors = errors;
                        return Object.keys(errors).length === 0;
                    }
                },
                { target: "idle" }
            ]
        },
        submitting: {
          entry: ({ context }) => {
            const isPatient = context.formValues?.patientNombre ? true : false;

            const payload = isPatient ? {
              name: context.formValues.patientNombre,
              surname: context.formValues.patientApellido,
              email: context.formValues.patientEmail,
              password: context.formValues.patientPassword,
              phone: context.formValues.patientTelefono || "",
              birthdate: context.formValues.patientFechaNacimiento || "",
              gender: context.formValues.patientGenero || "",
              medicalLicense: null,
              specialty: null,
              slotDurationMin: null
            } : {
              name: context.formValues.doctorNombre,
              surname: context.formValues.doctorApellido,
              email: context.formValues.doctorEmail,
              password: context.formValues.doctorPassword,
              phone: context.formValues.doctorTelefono || "",
              birthdate: context.formValues.doctorFechaNacimiento || "",
              gender: context.formValues.doctorGenero || "",
              medicalLicense: context.formValues.doctorMatricula,
              specialty: context.formValues.doctorEspecialidad,
              slotDurationMin: context.formValues.doctorSlotDurationMin || 30
            };

            fetch(isPatient
              ? "http://localhost:8080/api/auth/register/patient"
              : "http://localhost:8080/api/auth/register/doctor", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": "Basic " + btoa("test:test")
              },
              body: JSON.stringify(payload)
            })
            .then(res => {
              if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
              return res.json().catch(() => null);
            })
            .then(data => {
              console.log("API Response:", data);
              context.apiResponse = data;
            })
            .catch(err => {
              console.error("API Error:", err);
              context.apiResponse = { error: err.message };
            });
          },
          on: {
            API_DONE: {
              target: "idle",
              actions: assign({
                apiResponse: (_, event: any) => event.data
              })
            }
          }
        }
      }
    } as const);