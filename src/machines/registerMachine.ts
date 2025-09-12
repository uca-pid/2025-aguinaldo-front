import { createMachine, assign } from "xstate";
import {validateField} from "../utils/registerValidation";

export interface RegisterMachineContext {
  formValues: Record<string, any>;
  formErrors?: Record<string, string>;
  apiResponse?: any;
}

export type RegisterMachineEvent =
  | { type: "UPDATE_FORM"; key: string; value: any }
  | { type: "SUBMIT" }
  | { type: "API_DONE"; data: any };

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
        SUBMIT: { target: "validating" }
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
});