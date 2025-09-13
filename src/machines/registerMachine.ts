import { createMachine, assign } from "xstate";
import {validateField, checkFormValidation} from "../utils/registerValidation";
import { AuthService } from "../service/auth-service.service";

export interface RegisterMachineContext {
  isPatient: boolean;
  hasErrorsOrEmpty: boolean;
  formValues: {
    name: string;
    surname: string;
    dni: string;
    gender: string;
    birthdate: string | null;
    email: string;
    password: string;
    password_confirm: string;
    phone: string;
    specialty: string | null;
    medicalLicense: string | null;
    slotDurationMin?: number | null;
  };
  formErrors?: {
    [key: string]: string;
  };
  apiResponse?: any;
}

export type RegisterMachineEvent =
  | { type: "UPDATE_FORM"; key: string; value: any }
  | { type: "TOGGLE_USER_TYPE"; isPatient: boolean }
  | { type: "SUBMIT" }
  | { type: "API_DONE"; data: any };

export const registerMachine = createMachine({
  id: "register",
  initial: "idle",
  context: {
    isPatient: true,
    hasErrorsOrEmpty: true,
    formValues: {
      name: "", 
      surname: "", 
      dni: "", 
      gender: "", 
      birthdate: null, 
      email: "", 
      password: "", 
      password_confirm: "", 
      phone: "", 
      specialty: null, 
      medicalLicense: null, 
      slotDurationMin: null
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
          actions: assign(({ context, event }) => {
            const updatedFormValues = {
              ...context.formValues,
              [event.key]: event.value
            };

            const updatedFormErrors = {
              ...context.formErrors,
              [event.key]: validateField(event.key, event.value, context)
            };

            const updatedContext = {
              ...context,
              formValues: updatedFormValues,
              formErrors: updatedFormErrors
            };

            const hasErrorsOrEmpty = checkFormValidation(updatedContext);

            return {
              formValues: updatedFormValues,
              formErrors: updatedFormErrors,
              hasErrorsOrEmpty
            };
          })
        },
        TOGGLE_USER_TYPE: {
          actions: assign(({ context, event }) => {
            const updatedContext = {
              ...context,
              isPatient: event.isPatient
            };

            const hasErrorsOrEmpty = checkFormValidation(updatedContext);

            return {
              isPatient: event.isPatient,
              hasErrorsOrEmpty
            };
          })
        },
        SUBMIT: { 
          target: "validating" 
        }
      }
    },
    validating: {
      always: [
        {
          target: "submitting",
          guard: ({ context }) => {
            const errors: Record<string, string> = {};
            
            for (const [key, value] of Object.entries(context.formValues || {})) {
              if ((context.isPatient && key.startsWith("user")) || 
                  (!context.isPatient && (key.startsWith("user") || key.startsWith("doctor")))) {
                const error = validateField(key, value, context);
                if (error) errors[key] = error;
              }
            }
            
            context.formErrors = errors;
            
            return Object.keys(errors).length === 0;
          },
          actions: assign({
            formErrors: ({ context }) => {
              const errors: Record<string, string> = {};
              for (const [key, value] of Object.entries(context.formValues || {})) {
                if ((context.isPatient && key.startsWith("user")) || 
                    (!context.isPatient && (key.startsWith("user") || key.startsWith("doctor")))) {
                  const error = validateField(key, value, context);
                  if (error) errors[key] = error;
                }
              }
              return errors;
            },
            hasErrorsOrEmpty: ({ context }) => {
              const errors: Record<string, string> = {};
              for (const [key, value] of Object.entries(context.formValues || {})) {
                if ((context.isPatient && key.startsWith("user")) || 
                    (!context.isPatient && (key.startsWith("user") || key.startsWith("doctor")))) {
                  const error = validateField(key, value, context);
                  if (error) errors[key] = error;
                }
              }
              const updatedContext = { ...context, formErrors: errors };
              return checkFormValidation(updatedContext);
            }
          })
        },
        { 
          target: "idle",
          actions: assign({
            hasErrorsOrEmpty: ({ context }) => {
              return checkFormValidation(context);
            }
          })
        }
      ]
    },
    submitting: {
      entry: async ({ context }) => {
        try {

          const response = context.isPatient
            ? await AuthService.registerPatient(context.formValues)
            : await AuthService.registerDoctor(context.formValues);
          
          console.log("API Response:", response);
          context.apiResponse = response;
        } catch (error) {
          console.error("API Error:", error);
          context.apiResponse = { error: error instanceof Error ? error.message : 'Registration failed' };
        }
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