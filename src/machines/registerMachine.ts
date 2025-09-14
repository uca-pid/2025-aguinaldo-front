import { createMachine, assign } from "xstate";
import {validateField} from "../utils/registerValidation";

export interface RegisterMachineContext {
  formValues: {
    patient_name: string;
    patient_surname: string;
    patient_dni: string;
    patient_gender: string;
    patient_birthdate: string | null;
    patient_email: string;
    patient_password: string;
    patient_password_confirm: string;
    patient_phone: string;
    doctor_name: string;
    doctor_surname: string;
    doctor_specialty: string;
    doctor_medical_license: string;
    doctor_gender: string;
    doctor_birthdate: string | null;
    doctor_email: string;
    doctor_password: string;
    doctor_password_confirm: string;
    doctor_phone: string;
    doctor_slot_duration_min?: number;
  };
  formErrors?: {
    [key: string]: string;
  };
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
        patient_name: "", patient_surname: "", patient_dni: "", patient_gender: "", patient_birthdate: null,
        patient_email: "",  patient_password: "", patient_password_confirm: "", patient_phone: "",
        
        doctor_name: "", doctor_surname: "", doctor_specialty: "", doctor_medical_license: "", doctor_gender: "", 
        doctor_birthdate: null, doctor_email: "", doctor_password: "", doctor_password_confirm: "", doctor_phone: ""
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
            const formPrefix = context.formValues?.patient_name ? "patient" : "doctor";
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
        const isPatient = context.formValues?.patient_name ? true : false;

        const payload = isPatient ? {
          name: context.formValues.patient_name,
          surname: context.formValues.patient_surname,
          email: context.formValues.patient_email,
          password: context.formValues.patient_password,
          phone: context.formValues.patient_phone || "",
          birthdate: context.formValues.patient_birthdate || "",
          gender: context.formValues.patient_gender || "",
          medicalLicense: null,
          specialty: null,
          slotDurationMin: null
        } : {
          name: context.formValues.doctor_name,
          surname: context.formValues.doctor_surname,
          email: context.formValues.doctor_email,
          password: context.formValues.doctor_password,
          phone: context.formValues.doctor_phone || "",
          birthdate: context.formValues.doctor_birthdate || "",
          gender: context.formValues.doctor_gender || "",
          medicalLicense: context.formValues.doctor_medical_license,
          specialty: context.formValues.doctor_specialty,
          slotDurationMin: context.formValues.doctor_slot_duration_min || 30
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