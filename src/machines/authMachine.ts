import { createMachine, assign, fromPromise } from "xstate";
import {validateField, checkFormValidation} from "../utils/authFormValidation";
import { AuthService } from "../service/auth-service.service";

export interface AuthMachineContext {
  mode: "login" | "register";
  isPatient: boolean;
  hasErrorsOrEmpty: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: {
    id: string | null;
    email: string | null;
    name: string | null;
    surname: string | null;
    role: string | null;
  } | null;
  formValues: {
    // Login fields
    email: string;
    password: string;
    // Register fields
    name: string;
    surname: string;
    dni: string;
    gender: string;
    birthdate: string | null;
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

export const AuthMachineDefaultContext = {
    mode: "login",
    isPatient: true,
    hasErrorsOrEmpty: true,
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    user: null,
    formValues: {
      // Login fields
      email: "",
      password: "",
      // Register fields
      name: "", 
      surname: "", 
      dni: "", 
      gender: "", 
      birthdate: null, 
      password_confirm: "", 
      phone: "", 
      specialty: null, 
      medicalLicense: null, 
      slotDurationMin: null
    },
    formErrors: {},
    apiResponse: null
  } as AuthMachineContext;

export type AuthMachineEvent =
  | { type: "UPDATE_FORM"; key: string; value: any }
  | { type: "TOGGLE_USER_TYPE"; isPatient: boolean }
  | { type: "TOGGLE_MODE"; mode: "login" | "register" }
  | { type: "SUBMIT" }
  | { type: "API_SUCCESS"; data: any }
  | { type: "API_ERROR"; error: any }
  | { type: "LOGOUT" }
  | { type: "CHECK_AUTH" };


export const authMachine = createMachine({
  id: "auth",
  initial: "checkingAuth",
  context: AuthMachineDefaultContext,
  types: {
    context: {} as AuthMachineContext,
    events: {} as AuthMachineEvent,
  },
  states: {
    checkingAuth: {
      entry: assign(() => {
        const { accessToken, refreshToken } = AuthService.getStoredTokens();
        return {
          accessToken,
          refreshToken,
          isAuthenticated: !!(accessToken && refreshToken)
        };
      }),
      always: [
        {
          target: "authenticated",
          guard: ({ context }) => context.isAuthenticated
        },
        {
          target: "idle"
        }
      ]
    },
    authenticated: {
      on: {
        LOGOUT: {
          target: "idle",
          actions: assign((): AuthMachineContext => {
            AuthService.clearTokens();
            return AuthMachineDefaultContext;
          })
        }
      }
    },
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
        TOGGLE_MODE: {
          actions: assign(({ event }) => {
            return {
              mode: event.mode,
              hasErrorsOrEmpty: true,
              formErrors: {},
              apiResponse: null
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
      invoke: {
        src: fromPromise(async ({ input }: { input: AuthMachineContext }) => {
          try {
            let response;
            
            if (input.mode === "login") {
              response = await AuthService.signIn({
                email: input.formValues.email,
                password: input.formValues.password
              });
            } else {
              response = input.isPatient
                ? await AuthService.registerPatient(input.formValues)
                : await AuthService.registerDoctor(input.formValues);
            }
            
            return response;
          } catch (error) {
            throw error;
          }
        }),
        input: ({context}) => context,
        onDone: {
          target: "authenticated",
          actions: assign(({ event }) => {
            const response = event.output;
            
            if (response.accessToken && response.refreshToken) {
              AuthService.saveTokens(response.accessToken, response.refreshToken);
            }
            
            return {
              isAuthenticated: true,
              accessToken: response.accessToken || null,
              refreshToken: response.refreshToken || null,
              user: {
                id: response.id || null,
                email: response.email || null,
                name: response.name || null,
                surname: response.surname || null,
                role: response.role || null
              },
              apiResponse: response,
              formErrors: {},
              hasErrorsOrEmpty: true
            };
          })
        },
        onError: {
          target: "idle",
          actions: assign(({ event }) => {
            return {
              apiResponse: { 
                error: event.error instanceof Error ? event.error.message : 'Authentication failed' 
              }
            };
          })
        }
      }
    }
  }
});