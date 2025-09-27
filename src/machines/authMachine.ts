import { createMachine, assign, fromPromise } from "xstate";
import {validateField, checkFormValidation} from "../utils/authFormValidation";
import { checkStoredAuth, submitAuthentication, logoutUser } from "../utils/authMachineUtils";
import { AuthService } from "../service/auth-service.service";
import { RegisterResponse, SignInResponse, ApiErrorResponse } from "../models/Auth";
import { orchestrator } from "#/core/Orchestrator";

export const AUTH_MACHINE_ID = "auth";
export const AUTH_MACHINE_EVENT_TYPES = [
  'USER_AUTHENTICATED',
  'LOGOUT',
  'UPDATE_FORM',
  'TOGGLE_USER_TYPE',
  'TOGGLE_MODE',
  'SUBMIT',
  'CHECK_AUTH'
];

export interface AuthMachineContext {
  mode: "login" | "register";
  isPatient: boolean;
  hasErrorsOrEmpty: boolean;
  isAuthenticated: boolean;
  loading: boolean;
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
  authResponse?: RegisterResponse | SignInResponse | ApiErrorResponse | null;
  send: (event: any) => void;
}

export const AuthMachineDefaultContext = {
    mode: "login",
    isPatient: true,
    hasErrorsOrEmpty: true,
    isAuthenticated: false,
    loading: false,
    formValues: {
      email: "",
      password: "",
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
    authResponse: null,
    send: (event: any) => { orchestrator.send(event);}
  } as AuthMachineContext;

export type AuthMachineEvent =
  | { type: "UPDATE_FORM"; key: string; value: any }
  | { type: "TOGGLE_USER_TYPE"; isPatient: boolean }
  | { type: "TOGGLE_MODE"; mode: "login" | "register" }
  | { type: "SUBMIT" }
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
        const { authData, isAuthenticated } = checkStoredAuth();
        return {
          authResponse: authData,
          isAuthenticated
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
          target: "loggingOut"
        }
      },
      entry: ({ context }) => {
        if (context.authResponse && "accessToken" in context.authResponse) {
          // Send to dataMachine and profileMachine
          setTimeout(() => {
            const response = context.authResponse as SignInResponse;
            context.send({ 
              type: "SET_AUTH", 
              accessToken: response.accessToken, 
              userId: response.id,
              userRole: response.role
            });
          }, 0);
        }
      }
    },


    loggingOut: {
      invoke: {
        src: fromPromise(async () => {
          return await logoutUser();
        }),
        input: ({ context }) => context,
        onDone: {
          target: "idle",
          actions: [assign(() => ({
            isAuthenticated: false,
            authResponse: null
          })),
          () => {
            orchestrator.send({ type: "NAVIGATE", to: "/" });
          }
          ],
        },
        onError: {
          target: "idle",
          actions: [assign(() => ({
            isAuthenticated: false,
            authResponse: null
          })),
          () => {
            orchestrator.send({ type: "NAVIGATE", to: "/" });
          }
          ],
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
              authResponse: null,
              loading: false
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
      entry: assign(() => ({
        loading: true
      })),
      invoke: {
        src: fromPromise(async ({ input }: { input: AuthMachineContext }) => {
          return await submitAuthentication({ context: input });
        }),
        input: ({context}) => context,
        onDone: [
          {
            target: "authenticated",
            guard: ({ context }) => context.mode === "login",
            actions: assign(({ event }) => {
              const response = event.output;
              
              if (response.accessToken && response.refreshToken) {
                AuthService.saveAuthData(response);
              }
              
              return {
                isAuthenticated: true,
                authResponse: response,
                formValues: { ...AuthMachineDefaultContext.formValues },
                formErrors: {},
                hasErrorsOrEmpty: true,
                loading: false
              };
            })
          },
          {
            target: "idle",
            guard: ({ context }) => context.mode === "register",
            actions: assign(({ event, context }): AuthMachineContext => {
              const response = event.output;
              
              return {
                ...context,
                mode: "login",
                formValues: {
                  ...AuthMachineDefaultContext.formValues,
                  email: context.formValues.email,
                },
                authResponse: {
                  ...response,
                  message: "Registration successful! Please sign in with your credentials."
                },
                formErrors: {},
                hasErrorsOrEmpty: false,
                isAuthenticated: false,
                loading: false
              };
            })
          }
        ],
        onError: {
          target: "idle",
          actions: assign(({ event }) => {
            return {
              authResponse: { 
                error: event.error instanceof Error ? event.error.message : 'Authentication failed' 
              },
              loading: false
            };
          })
        }
      }
    },
  
  }
});