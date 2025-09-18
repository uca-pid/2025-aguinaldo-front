import { createMachine, assign, fromPromise } from "xstate";
import {validateField, checkFormValidation} from "../utils/authFormValidation";
import { AuthService } from "../service/auth-service.service";
import { RegisterResponse, SignInResponse, ApiErrorResponse } from "../models/Auth";
import { ProfileResponse } from "../models/Auth";

export interface AuthMachineContext {
  mode: "login" | "register";
  isPatient: boolean;
  hasErrorsOrEmpty: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  updatingProfile: boolean;
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
  profile?:ProfileResponse|null;
}

export const AuthMachineDefaultContext = {
    mode: "login",
    isPatient: true,
    hasErrorsOrEmpty: true,
    isAuthenticated: false,
    loading: false,
    updatingProfile: false,
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
    authResponse: null,
    profile:null,
  } as AuthMachineContext;

export type AuthMachineEvent =
  | { type: "UPDATE_FORM"; key: string; value: any }
  | { type: "TOGGLE_USER_TYPE"; isPatient: boolean }
  | { type: "TOGGLE_MODE"; mode: "login" | "register" }
  | { type: "SUBMIT" }
  | { type: "API_SUCCESS"; data: any }
  | { type: "API_ERROR"; error: any }
  | { type: "LOGOUT" }
  | { type: "CHECK_AUTH" }
  | { type: "SAVE_PROFILE" }
  | { type: "UPDATE_PROFILE" }
  | { type: "CANCEL_PROFILE_EDIT"; key: string }
  | { type: "DEACTIVATE_ACCOUNT" }; 


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
        const authData = AuthService.getStoredAuthData();
        return {
          authResponse: authData,
          isAuthenticated: !!(authData?.accessToken && authData?.refreshToken)
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
        },
        SAVE_PROFILE:{
          target:"savingProfile"
        },
        UPDATE_PROFILE: {
          target: "updatingProfile"
        },
        DEACTIVATE_ACCOUNT: {
          target: "deactivatingAccount"
        },
        UPDATE_FORM: {
          actions: assign(({ context, event }) => {
            return {
              ...context,
              formValues: {
                ...context.formValues,
                [event.key]: event.value
              }
            };
          })
        },
        CANCEL_PROFILE_EDIT: {
          actions: assign(({ context, event }) => {
            if (!context.profile) return context;
            return {
              ...context,
              formValues: {
                ...context.formValues,
                [event.key]: (context.profile as any)[event.key] || ""
              }
            };
          })
        }
      }
    },
    savingProfile: {
      invoke: {
        src: fromPromise(async ({ input }: { input: AuthMachineContext }) => {
          if (!input.authResponse || !("accessToken" in input.authResponse)) {
            throw new Error("No access token available");
          }

          const accessToken = input.authResponse.accessToken;
          const profileId = input.authResponse.id; 

          const profile = await AuthService.getProfile(accessToken, profileId);
          return profile;
        }),
        input: ({ context }) => context,
        onDone: {
          target: "authenticated",
          actions: assign(({ event, context }) => {
            return {
              ...context,
              profile: event.output, 
            };
          }),
        },
        onError: {
          target: "authenticated", 
          actions: assign(({ event, context }) => {
            return {
              ...context,
              profile: null,
              authResponse: {
                error:
                  event.error instanceof Error
                    ? event.error.message
                    : "Failed to fetch profile",
              },
            };
          }),
        },
      },
    },

    updatingProfile: {
      entry: assign(({ context }) => ({
        ...context,
        updatingProfile: true
      })),
      invoke: {
        src: fromPromise(async ({ input }: { input: AuthMachineContext }) => {
          if (!input.authResponse || !("accessToken" in input.authResponse)) {
            throw new Error("No access token available");
          }

          const accessToken = input.authResponse.accessToken;
          const profileId = input.authResponse.id;

          // Construir el objeto de datos a actualizar usando formValues
          const updateData: any = {};
          
          // Mapear formValues a los campos del perfil
          Object.keys(input.formValues).forEach(key => {
            const value = input.formValues[key as keyof typeof input.formValues];
            if (value !== null && value !== undefined && value !== "") {
              updateData[key] = value;
            }
          });

          const updatedProfile = await AuthService.updateProfile(accessToken, profileId, updateData);
          return updatedProfile;
        }),
        input: ({ context }) => context,
        onDone: {
          target: "authenticated",
          actions: assign(({ event, context }) => {
            // Actualizar tanto el profile como el authResponse con los nuevos datos
            const updatedProfile = event.output;
            const updatedAuthResponse = context.authResponse && "accessToken" in context.authResponse 
              ? {
                  ...context.authResponse,
                  name: updatedProfile.name,
                  surname: updatedProfile.surname,
                  email: updatedProfile.email,
                  phone: updatedProfile.phone
                }
              : context.authResponse;

            return {
              ...context,
              profile: updatedProfile,
              authResponse: updatedAuthResponse,
              updatingProfile: false
            };
          }),
        },
        onError: {
          target: "authenticated",
          actions: assign(({ event, context }) => {
            console.error("Failed to update profile:", event.error);
            return {
              ...context,
              updatingProfile: false,
              authResponse: {
                error:
                  event.error instanceof Error
                    ? event.error.message
                    : "Failed to update profile",
              },
            };
          }),
        },
      },
    },

    deactivatingAccount: {
      invoke: {
        src: fromPromise(async ({ input }: { input: AuthMachineContext }) => {
          try {
            if (!input.authResponse || !("accessToken" in input.authResponse)) {
              throw new Error("No access token available");
            }
            
            const accessToken = input.authResponse.accessToken;
            console.log('Iniciando desactivación desde máquina de estado...');
            await AuthService.deactivateAccount(accessToken);
            console.log('Desactivación completada desde máquina de estado');
            return { success: true };
          } catch (error) {
            console.error('Error en desactivación desde máquina de estado:', error);
            throw error;
          }
        }),
        input: ({ context }) => context,
        onDone: {
          target: "idle",
          actions: assign(() => {
            console.log('Limpiando estado después de desactivación...');
            
            return {
              token: null,
              profile: null,
              formValues: { ...AuthMachineDefaultContext.formValues },
              error: null,
              isAuthenticated: false,
              authResponse: null,
              updatingProfile: false
            };
          })
        },
        onError: {
          target: "authenticated",
          actions: assign(({ event, context }) => {
            console.error('Error en desactivación, volviendo a authenticated:', event.error);
            return {
              ...context,
              authResponse: {
                error: (event.error as Error).message
              }
            };
          })
        }
      }
    },

    loggingOut: {
      invoke: {
        src: fromPromise(async () => {
          try {
            const authData = AuthService.getStoredAuthData();
            if (authData?.refreshToken) {
              await AuthService.signOut(authData.refreshToken);
            }
            AuthService.clearAuthData();
            return true;
          } catch (error) {
            console.warn('Logout API call failed, but clearing local data:', error);
            AuthService.clearAuthData();
            return true;
          }
        }),
        input: ({ context }) => context,
        onDone: {
          target: "idle",
          actions: assign(() => ({
            isAuthenticated: false,
            authResponse: null
          }))
        },
        onError: {
          target: "idle",
          actions: assign(() => ({
            isAuthenticated: false,
            authResponse: null
          }))
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