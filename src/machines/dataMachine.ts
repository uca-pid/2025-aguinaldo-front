import { createMachine, assign, fromPromise } from "xstate";
import { loadDoctors, loadPendingDoctors, loadAdminStats, loadAvailableTurns, loadMyTurns } from "../utils/dataMachineUtils";
import { loadDoctorPatients, loadDoctorAvailability } from "../utils/doctorMachineUtils";
import { orchestrator } from "#/core/Orchestrator";
import type { PendingDoctor, AdminStats } from "../models/Admin";
import type { Doctor } from "../models/Turn";
import { UI_MACHINE_ID } from "./uiMachine";
import { AUTH_MACHINE_ID } from "./authMachine";

export const DATA_MACHINE_ID = "data";
export const DATA_MACHINE_EVENT_TYPES = [
  "SET_AUTH",
  "CLEAR_ACCESS_TOKEN", 
  "RELOAD_DOCTORS",
  "RELOAD_PENDING_DOCTORS", 
  "RELOAD_ADMIN_STATS",
  "RELOAD_ALL",
  "LOAD_AVAILABLE_TURNS",
  "LOAD_MY_TURNS",
  "LOAD_DOCTOR_PATIENTS",
  "LOAD_DOCTOR_AVAILABILITY",
  "INIT_PATIENTS_PAGE",
  "RETRY_DOCTOR_PATIENTS"
];

export interface DataMachineContext {
  accessToken: string | null;
  userRole: string | null;
  userId: string | null;
  doctorId: string | null;
  
  doctors: Doctor[];
  pendingDoctors: PendingDoctor[];
  adminStats: AdminStats;
  availableTurns: string[];
  myTurns: any[];
  doctorPatients: any[];
  doctorAvailability: any[];
  
  loading: {
    doctors: boolean;
    pendingDoctors: boolean;
    adminStats: boolean;
    availableTurns: boolean;
    myTurns: boolean;
    doctorPatients: boolean;
    doctorAvailability: boolean;
  };
  
  errors: {
    doctors: string | null;
    pendingDoctors: string | null;
    adminStats: string | null;
    availableTurns: string | null;
    myTurns: string | null;
    doctorPatients: string | null;
    doctorAvailability: string | null;
  };
}

export const DataMachineDefaultContext: DataMachineContext = {
  accessToken: null,
  userRole: null,
  userId: null,
  doctorId: null,
  
  doctors: [],
  pendingDoctors: [],
  adminStats: { patients: 0, doctors: 0, pending: 0 },
  availableTurns: [],
  myTurns: [],
  doctorPatients: [],
  doctorAvailability: [],
  
  loading: {
    doctors: false,
    pendingDoctors: false,
    adminStats: false,
    availableTurns: false,
    myTurns: false,
    doctorPatients: false,
    doctorAvailability: false,
  },
  
  errors: {
    doctors: null,
    pendingDoctors: null,
    adminStats: null,
    availableTurns: null,
    myTurns: null,
    doctorPatients: null,
    doctorAvailability: null,
  },
};

export type DataMachineEvent =
  | { type: "SET_AUTH"; accessToken: string; userId: string; userRole: string; doctorId?: string }
  | { type: "CLEAR_ACCESS_TOKEN" }
  | { type: "RELOAD_DOCTORS" }
  | { type: "RELOAD_PENDING_DOCTORS" }
  | { type: "RELOAD_ADMIN_STATS" }
  | { type: "RELOAD_ALL" }
  | { type: "LOAD_AVAILABLE_TURNS"; doctorId: string; date: string }
  | { type: "LOAD_MY_TURNS"; status?: string }
  | { type: "LOAD_DOCTOR_PATIENTS" }
  | { type: "LOAD_DOCTOR_AVAILABILITY" }
  | { type: "INIT_PATIENTS_PAGE" }
  | { type: "RETRY_DOCTOR_PATIENTS" };

export const dataMachine = createMachine({
  id: "data",
  initial: "idle",
  context: DataMachineDefaultContext,
  types: {
    context: {} as DataMachineContext,
    events: {} as DataMachineEvent,
  },
  states: {
    idle: {
      on: {
        SET_AUTH: {
          target: "loadingInitialData",
          actions: assign({
            accessToken: ({ event }) => {
              console.log('[DataMachine] Received SET_AUTH:', event);
              return event.accessToken;
            },
            userRole: ({ event }) => event.userRole,
            userId: ({ event }) => event.userId,
            doctorId: ({ event }) => event.userRole === "DOCTOR" ? event.userId : null,
          }),
        },
        CLEAR_ACCESS_TOKEN: {
          actions: assign({
            accessToken: null,
            userRole: null,
            userId: null,
            doctorId: null,
            doctors: [],
            pendingDoctors: [],
            adminStats: { patients: 0, doctors: 0, pending: 0 },
            availableTurns: [],
            myTurns: [],
            doctorPatients: [],
            doctorAvailability: [],
          }),
        },
        RELOAD_DOCTORS: {
          target: "fetchingDoctors",
          guard: ({ context }) => !!context.accessToken,
        },
        RELOAD_PENDING_DOCTORS: {
          target: "fetchingPendingDoctors",
          guard: ({ context }) => !!context.accessToken,
        },
        RELOAD_ADMIN_STATS: {
          target: "fetchingAdminStats",
          guard: ({ context }) => !!context.accessToken,
        },
        RELOAD_ALL: {
          target: "loadingInitialData",
          guard: ({ context }) => !!context.accessToken,
        },
        LOAD_AVAILABLE_TURNS: {
          target: "fetchingAvailableTurns",
          guard: ({ context }) => !!context.accessToken,
        },
        LOAD_MY_TURNS: {
          target: "fetchingMyTurns",
          guard: ({ context }) => !!context.accessToken,
        },
        LOAD_DOCTOR_PATIENTS: {
          target: "fetchingDoctorPatients",
          guard: ({ context }) => !!context.accessToken,
        },
        LOAD_DOCTOR_AVAILABILITY: {
          target: "fetchingDoctorAvailability",
          guard: ({ context }) => !!context.accessToken,
        },
        INIT_PATIENTS_PAGE: [
          {
            target: "fetchingDoctorPatients",
            guard: ({ context }) => {
              console.log('[DataMachine] INIT_PATIENTS_PAGE guard check:', {
                hasAccessToken: !!context.accessToken,
                accessToken: context.accessToken,
                doctorId: context.doctorId,
                currentState: context
              });
              return !!context.accessToken;
            },
          },
          {
            actions: () => {
              console.log('[DataMachine] INIT_PATIENTS_PAGE received but guard failed');
            }
          }
        ],
        RETRY_DOCTOR_PATIENTS: {
          target: "fetchingDoctorPatients",
          guard: ({ context }) => !!context.accessToken,
        },
      },
    },
    
    loadingInitialData: {
      entry: assign(({ context }) => {
        const isAdmin = context.userRole === "ADMIN";
        const isDoctor = context.userRole === "DOCTOR";
        const isPatient = context.userRole === "PATIENT";
        return {
          loading: {
            doctors: true,
            pendingDoctors: isAdmin,
            adminStats: isAdmin,
            availableTurns: false,
            myTurns: isPatient || isDoctor, // Load turns for patients and doctors
            doctorPatients: false,
            doctorAvailability: isDoctor,
          },
          errors: {
            doctors: null,
            pendingDoctors: null,
            adminStats: null,
            availableTurns: null,
            myTurns: null,
            doctorPatients: null,
            doctorAvailability: null,
          },
        };
      }),
      invoke: [
        {
          id: "loadDoctors",
          src: fromPromise(async ({ input }: { input: { accessToken: string } }) => {
            return await loadDoctors(input);
          }),
          input: ({ context }) => ({ accessToken: context.accessToken! }),
          onDone: {
            actions: assign({
              doctors: ({ event }) => event.output,
              loading: ({ context }) => ({ ...context.loading, doctors: false }),
            }),
          },
          onError: {
            target: "idle",
            actions: [
              assign({
                errors: ({ context, event }) => ({
                  ...context.errors,
                  doctors: event.error instanceof Error ? event.error.message : "Error al cargar doctores"
                }),
                loading: ({ context }) => ({
                  ...context.loading,
                  doctors: false
                })
              }),
              ({ event }) => {
                if (event.error instanceof Error && (event.error.message.includes('401') || event.error.message.toLowerCase().includes('unauthorized'))) {
                  orchestrator.sendToMachine(AUTH_MACHINE_ID, { type: "LOGOUT" });
                }
                const errorMessage = event.error instanceof Error ? event.error.message : "Error al cargar doctores";
                orchestrator.sendToMachine(UI_MACHINE_ID, {
                  type: "OPEN_SNACKBAR",
                  message: errorMessage,
                  severity: "error"
                });
              }
            ],
          },
        },
        {
          id: "loadPendingDoctors", 
          src: fromPromise(async ({ input }: { input: { accessToken: string; isAdmin: boolean } }) => {
            if (!input.isAdmin) return [];
            return await loadPendingDoctors(input);
          }),
          input: ({ context }) => ({ accessToken: context.accessToken!, isAdmin: context.userRole === "ADMIN" }),
          onDone: {
            actions: assign({
              pendingDoctors: ({ event }) => event.output,
              loading: ({ context }) => ({ ...context.loading, pendingDoctors: false }),
            }),
          },
          onError: {
            target: "idle",
            actions: [
              assign({
                errors: ({ context, event }) => ({
                  ...context.errors,
                  pendingDoctors: event.error instanceof Error ? event.error.message : "Error al cargar doctores pendientes"
                }),
                loading: ({ context }) => ({
                  ...context.loading,
                  pendingDoctors: false
                })
              }),
              ({ event }) => {
                if (event.error instanceof Error && (event.error.message.includes('401') || event.error.message.toLowerCase().includes('unauthorized'))) {
                  orchestrator.sendToMachine(AUTH_MACHINE_ID, { type: "LOGOUT" });
                }
                const errorMessage = event.error instanceof Error ? event.error.message : "Error al cargar doctores pendientes";
                orchestrator.sendToMachine(UI_MACHINE_ID, {
                  type: "OPEN_SNACKBAR",
                  message: errorMessage,
                  severity: "error"
                });
              }
            ],
          },
        },
        {
          id: "loadAdminStats",
          src: fromPromise(async ({ input }: { input: { accessToken: string; isAdmin: boolean } }) => {
            if (!input.isAdmin) return { patients: 0, doctors: 0, pending: 0 };
            return await loadAdminStats(input);
          }),
          input: ({ context }) => ({ accessToken: context.accessToken!, isAdmin: context.userRole === "ADMIN" }),
          onDone: {
            actions: assign({
              adminStats: ({ event }) => event.output,
              loading: ({ context }) => ({ ...context.loading, adminStats: false }),
            }),
          },
          onError: {
            target: "idle",
            actions: [
              assign({
                errors: ({ context, event }) => ({
                  ...context.errors,
                  adminStats: event.error instanceof Error ? event.error.message : "Error al cargar estadísticas"
                }),
                loading: ({ context }) => ({
                  ...context.loading,
                  adminStats: false
                })
              }),
              ({ event }) => {
                if (event.error instanceof Error && (event.error.message.includes('401') || event.error.message.toLowerCase().includes('unauthorized'))) {
                  orchestrator.sendToMachine(AUTH_MACHINE_ID, { type: "LOGOUT" });
                }
                const errorMessage = event.error instanceof Error ? event.error.message : "Error al cargar estadísticas";
                orchestrator.sendToMachine(UI_MACHINE_ID, {
                  type: "OPEN_SNACKBAR",
                  message: errorMessage,
                  severity: "error"
                });
              }
            ],
          },
        },
        {
          id: "loadDoctorAvailability",
          src: fromPromise(async ({ input }: { input: { accessToken: string; isDoctor: boolean; doctorId: string | null } }) => {
            if (!input.isDoctor || !input.doctorId) return null;
            return await loadDoctorAvailability({ accessToken: input.accessToken, doctorId: input.doctorId });
          }),
          input: ({ context }) => ({ 
            accessToken: context.accessToken!, 
            isDoctor: context.userRole === "DOCTOR",
            doctorId: context.doctorId
          }),
          onDone: {
            actions: assign({
              doctorAvailability: ({ event }) => event.output,
              loading: ({ context }) => ({ ...context.loading, doctorAvailability: false }),
            }),
          },
          onError: {
            target: "idle",
            actions: [
              assign({
                errors: ({ context, event }) => ({
                  ...context.errors,
                  doctorAvailability: event.error instanceof Error ? event.error.message : "Error al cargar disponibilidad"
                }),
                loading: ({ context }) => ({
                  ...context.loading,
                  doctorAvailability: false
                })
              }),
              ({ event }) => {
                if (event.error instanceof Error && (event.error.message.includes('401') || event.error.message.toLowerCase().includes('unauthorized'))) {
                  orchestrator.sendToMachine(AUTH_MACHINE_ID, { type: "LOGOUT" });
                }
                const errorMessage = event.error instanceof Error ? event.error.message : "Error al cargar disponibilidad";
                orchestrator.sendToMachine(UI_MACHINE_ID, {
                  type: "OPEN_SNACKBAR",
                  message: errorMessage,
                  severity: "error"
                });
              }
            ],
          },
        },
        {
          id: "loadMyTurns",
          src: fromPromise(async ({ input }: { input: { accessToken: string; isPatient: boolean; isDoctor: boolean } }) => {
            if (!input.isPatient && !input.isDoctor) return [];
            return await loadMyTurns({ accessToken: input.accessToken });
          }),
          input: ({ context }) => ({ 
            accessToken: context.accessToken!, 
            isPatient: context.userRole === "PATIENT",
            isDoctor: context.userRole === "DOCTOR"
          }),
          onDone: {
            actions: assign({
              myTurns: ({ event }) => event.output,
              loading: ({ context }) => ({ ...context.loading, myTurns: false }),
            }),
          },
          onError: {
            target: "idle",
            actions: [
              assign({
                errors: ({ context, event }) => ({
                  ...context.errors,
                  myTurns: event.error instanceof Error ? event.error.message : "Error al cargar mis turnos"
                }),
                loading: ({ context }) => ({
                  ...context.loading,
                  myTurns: false
                })
              }),
              ({ event }) => {
                if (event.error instanceof Error && (event.error.message.includes('401') || event.error.message.toLowerCase().includes('unauthorized'))) {
                  orchestrator.sendToMachine(AUTH_MACHINE_ID, { type: "LOGOUT" });
                }
                const errorMessage = event.error instanceof Error ? event.error.message : "Error al cargar mis turnos";
                orchestrator.sendToMachine(UI_MACHINE_ID, {
                  type: "OPEN_SNACKBAR",
                  message: errorMessage,
                  severity: "error"
                });
              }
            ],
          },
        },
      ],
      always: {
        target: "ready",
        guard: ({ context }) => {
          const isAdmin = context.userRole === "ADMIN";
          const isDoctor = context.userRole === "DOCTOR";
          const isPatient = context.userRole === "PATIENT";
          return !context.loading.doctors && 
                 (!isAdmin || !context.loading.pendingDoctors) && 
                 (!isAdmin || !context.loading.adminStats) &&
                 (!isDoctor || !context.loading.doctorAvailability) &&
                 (!(isPatient || isDoctor) || !context.loading.myTurns);
        },
      },
    },
    
    ready: {
      entry: ({ context }) => {
        // Use setTimeout to ensure all assign actions complete before broadcasting
        setTimeout(() => {
          orchestrator.send({
            type: "DATA_LOADED",
            doctorAvailability: context.doctorAvailability
          });
        }, 0);
      },
      on: {
        SET_AUTH: {
          target: "loadingInitialData",
          actions: assign({
            accessToken: ({ event }) => event.accessToken,
            userRole: ({ event }) => event.userRole,
            userId: ({ event }) => event.userId,
            doctorId: ({ event }) => event.userRole === "DOCTOR" ? event.userId : null,
          }),
        },
        CLEAR_ACCESS_TOKEN: {
          target: "idle",
          actions: assign({
            accessToken: null,
            userRole: null,
            userId: null,
            doctorId: null,
            doctors: [],
            pendingDoctors: [],
            adminStats: { patients: 0, doctors: 0, pending: 0 },
            availableTurns: [],
            myTurns: [],
            doctorPatients: [],
            doctorAvailability: [],
          }),
        },
        RELOAD_DOCTORS: {
          target: "fetchingDoctors",
        },
        RELOAD_PENDING_DOCTORS: {
          target: "fetchingPendingDoctors",
        },
        RELOAD_ADMIN_STATS: {
          target: "fetchingAdminStats",
        },
        RELOAD_ALL: {
          target: "loadingInitialData",
        },
        LOAD_AVAILABLE_TURNS: {
          target: "fetchingAvailableTurns",
        },
        LOAD_MY_TURNS: {
          target: "fetchingMyTurns",
        },
        LOAD_DOCTOR_PATIENTS: {
          target: "fetchingDoctorPatients",
        },
        LOAD_DOCTOR_AVAILABILITY: {
          target: "fetchingDoctorAvailability",
        },
        INIT_PATIENTS_PAGE: {
          target: "fetchingDoctorPatients",
          actions: () => {
            console.log('[DataMachine] INIT_PATIENTS_PAGE received in ready state');
          }
        },
        RETRY_DOCTOR_PATIENTS: {
          target: "fetchingDoctorPatients",
          actions: () => {
            console.log('[DataMachine] RETRY_DOCTOR_PATIENTS received in ready state');
          }
        },
      },
    },
    
    fetchingDoctors: {
      entry: assign({
        loading: ({ context }) => ({ ...context.loading, doctors: true }),
        errors: ({ context }) => ({ ...context.errors, doctors: null }),
      }),
      invoke: {
        src: fromPromise(async ({ input }: { input: { accessToken: string } }) => {
          return await loadDoctors(input);
        }),
        input: ({ context }) => ({ accessToken: context.accessToken! }),
        onDone: {
          target: "ready",
          actions: assign({
            doctors: ({ event }) => event.output,
            loading: ({ context }) => ({ ...context.loading, doctors: false }),
          }),
        },
        onError: {
          target: "idle",
          actions: [
            assign({
              errors: ({ context, event }) => ({
                ...context.errors,
                doctors: event.error instanceof Error ? event.error.message : "Error al cargar doctores"
              }),
              loading: ({ context }) => ({
                ...context.loading,
                doctors: false
              })
            }),
            ({ event }) => {
              if (event.error instanceof Error && (event.error.message.includes('401') || event.error.message.toLowerCase().includes('unauthorized'))) {
                orchestrator.sendToMachine(AUTH_MACHINE_ID, { type: "LOGOUT" });
              }
              const errorMessage = event.error instanceof Error ? event.error.message : "Error al cargar doctores";
              orchestrator.sendToMachine(UI_MACHINE_ID, {
                type: "OPEN_SNACKBAR",
                message: errorMessage,
                severity: "error"
              });
            }
          ],
        },
      },
    },
    
    fetchingPendingDoctors: {
      entry: assign({
        loading: ({ context }) => ({ ...context.loading, pendingDoctors: true }),
        errors: ({ context }) => ({ ...context.errors, pendingDoctors: null }),
      }),
      invoke: {
        src: fromPromise(async ({ input }: { input: { accessToken: string } }) => {
          return await loadPendingDoctors({ accessToken: input.accessToken, isAdmin: true });
        }),
        input: ({ context }) => ({ accessToken: context.accessToken! }),
        onDone: {
          target: "ready",
          actions: assign({
            pendingDoctors: ({ event }) => event.output,
            loading: ({ context }) => ({ ...context.loading, pendingDoctors: false }),
          }),
        },
        onError: {
          target: "idle",
          actions: [
            assign({
              errors: ({ context, event }) => ({
                ...context.errors,
                pendingDoctors: event.error instanceof Error ? event.error.message : "Error al cargar doctores pendientes"
              }),
              loading: ({ context }) => ({
                ...context.loading,
                pendingDoctors: false
              })
            }),
            ({ event }) => {
              if (event.error instanceof Error && (event.error.message.includes('401') || event.error.message.toLowerCase().includes('unauthorized'))) {
                orchestrator.sendToMachine(AUTH_MACHINE_ID, { type: "LOGOUT" });
              }
              const errorMessage = event.error instanceof Error ? event.error.message : "Error al cargar doctores pendientes";
              orchestrator.sendToMachine(UI_MACHINE_ID, {
                type: "OPEN_SNACKBAR",
                message: errorMessage,
                severity: "error"
              });
            }
          ],
        },
      },
    },
    
    fetchingAdminStats: {
      entry: assign({
        loading: ({ context }) => ({ ...context.loading, adminStats: true }),
        errors: ({ context }) => ({ ...context.errors, adminStats: null }),
      }),
      invoke: {
        src: fromPromise(async ({ input }: { input: { accessToken: string } }) => {
          return await loadAdminStats({ accessToken: input.accessToken, isAdmin: true });
        }),
        input: ({ context }) => ({ accessToken: context.accessToken! }),
        onDone: {
          target: "ready",
          actions: assign({
            adminStats: ({ event }) => event.output,
            loading: ({ context }) => ({ ...context.loading, adminStats: false }),
          }),
        },
        onError: {
          target: "idle",
          actions: [
            assign({
              errors: ({ context, event }) => ({
                ...context.errors,
                adminStats: event.error instanceof Error ? event.error.message : "Error al cargar estadísticas"
              }),
              loading: ({ context }) => ({
                ...context.loading,
                adminStats: false
              })
            }),
            ({ event }) => {
              if (event.error instanceof Error && (event.error.message.includes('401') || event.error.message.toLowerCase().includes('unauthorized'))) {
                orchestrator.sendToMachine(AUTH_MACHINE_ID, { type: "LOGOUT" });
              }
              const errorMessage = event.error instanceof Error ? event.error.message : "Error al cargar estadísticas";
              orchestrator.sendToMachine(UI_MACHINE_ID, {
                type: "OPEN_SNACKBAR",
                message: errorMessage,
                severity: "error"
              });
            }
          ],
        },
      },
    },
    
    fetchingAvailableTurns: {
      entry: assign({
        loading: ({ context }) => ({ ...context.loading, availableTurns: true }),
        errors: ({ context }) => ({ ...context.errors, availableTurns: null }),
      }),
      invoke: {
        src: fromPromise(async ({ input }: { input: { accessToken: string; doctorId: string; date: string } }) => {
          return await loadAvailableTurns(input);
        }),
        input: ({ context, event }) => ({
          accessToken: context.accessToken!,
          doctorId: (event as any).doctorId,
          date: (event as any).date
        }),
        onDone: {
          target: "ready",
          actions: assign({
            availableTurns: ({ event }) => event.output,
            loading: ({ context }) => ({ ...context.loading, availableTurns: false }),
          }),
        },
        onError: {
          target: "idle",
          actions: [
            assign({
              errors: ({ context, event }) => ({
                ...context.errors,
                availableTurns: event.error instanceof Error ? event.error.message : "Error al cargar turnos disponibles"
              }),
              loading: ({ context }) => ({
                ...context.loading,
                availableTurns: false
              })
            }),
            ({ event }) => {
              if (event.error instanceof Error && (event.error.message.includes('401') || event.error.message.toLowerCase().includes('unauthorized'))) {
                orchestrator.sendToMachine(AUTH_MACHINE_ID, { type: "LOGOUT" });
              }
              const errorMessage = event.error instanceof Error ? event.error.message : "Error al cargar turnos disponibles";
              orchestrator.sendToMachine(UI_MACHINE_ID, {
                type: "OPEN_SNACKBAR",
                message: errorMessage,
                severity: "error"
              });
            }
          ],
        },
      },
    },
    
    fetchingMyTurns: {
      entry: assign({
        loading: ({ context }) => ({ ...context.loading, myTurns: true }),
        errors: ({ context }) => ({ ...context.errors, myTurns: null }),
      }),
      invoke: {
        src: fromPromise(async ({ input }: { input: { accessToken: string; status?: string } }) => {
          return await loadMyTurns(input);
        }),
        input: ({ context, event }) => ({
          accessToken: context.accessToken!,
          status: (event as any).status
        }),
        onDone: {
          target: "ready",
          actions: assign({
            myTurns: ({ event }) => event.output,
            loading: ({ context }) => ({ ...context.loading, myTurns: false }),
          }),
        },
        onError: {
          target: "idle",
          actions: [
            assign({
              errors: ({ context, event }) => ({
                ...context.errors,
                myTurns: event.error instanceof Error ? event.error.message : "Error al cargar mis turnos"
              }),
              loading: ({ context }) => ({
                ...context.loading,
                myTurns: false
              })
            }),
            ({ event }) => {
              if (event.error instanceof Error && (event.error.message.includes('401') || event.error.message.toLowerCase().includes('unauthorized'))) {
                orchestrator.sendToMachine(AUTH_MACHINE_ID, { type: "LOGOUT" });
              }
              const errorMessage = event.error instanceof Error ? event.error.message : "Error al cargar mis turnos";
              orchestrator.sendToMachine(UI_MACHINE_ID, {
                type: "OPEN_SNACKBAR",
                message: errorMessage,
                severity: "error"
              });
            }
          ],
        },
      },
    },
    
    fetchingDoctorPatients: {
      entry: assign({
        loading: ({ context }) => ({ ...context.loading, doctorPatients: true }),
        errors: ({ context }) => ({ ...context.errors, doctorPatients: null }),
      }),
      invoke: {
        src: fromPromise(async ({ input }: { input: { accessToken: string; doctorId: string } }) => {
          return await loadDoctorPatients(input);
        }),
        input: ({ context }) => ({ 
          accessToken: context.accessToken!,
          doctorId: context.doctorId!
        }),
        onDone: {
          target: "ready",
          actions: [
            assign({
              doctorPatients: ({ event }) => event.output,
              loading: ({ context }) => ({ ...context.loading, doctorPatients: false }),
            }),
            () => {
              // Notify doctor machine that patients have been loaded
              orchestrator.send({
                type: "DATA_LOADED"
              });
            }
          ],
        },
        onError: {
          target: "idle",
          actions: [
            assign({
              errors: ({ context, event }) => ({
                ...context.errors,
                doctorPatients: event.error instanceof Error ? event.error.message : "Error al cargar pacientes del doctor"
              }),
              loading: ({ context }) => ({
                ...context.loading,
                doctorPatients: false
              })
            }),
            ({ event }) => {
              if (event.error instanceof Error && (event.error.message.includes('401') || event.error.message.toLowerCase().includes('unauthorized'))) {
                orchestrator.sendToMachine(AUTH_MACHINE_ID, { type: "LOGOUT" });
              }
              const errorMessage = event.error instanceof Error ? event.error.message : "Error al cargar pacientes del doctor";
              orchestrator.sendToMachine(UI_MACHINE_ID, {
                type: "OPEN_SNACKBAR",
                message: errorMessage,
                severity: "error"
              });
            }
          ],
        },
      },
    },
    
    fetchingDoctorAvailability: {
      entry: assign({
        loading: ({ context }) => ({ ...context.loading, doctorAvailability: true }),
        errors: ({ context }) => ({ ...context.errors, doctorAvailability: null }),
      }),
      invoke: {
        src: fromPromise(async ({ input }: { input: { accessToken: string; doctorId: string } }) => {
          return await loadDoctorAvailability(input);
        }),
        input: ({ context }) => ({ 
          accessToken: context.accessToken!,
          doctorId: context.doctorId!
        }),
        onDone: {
          target: "ready",
          actions: assign({
            doctorAvailability: ({ event }) => event.output,
            loading: ({ context }) => ({ ...context.loading, doctorAvailability: false }),
          }),
        },
        onError: {
          target: "idle",
          actions: [
            assign({
              errors: ({ context, event }) => ({
                ...context.errors,
                doctorAvailability: event.error instanceof Error ? event.error.message : "Error al cargar disponibilidad del doctor"
              }),
              loading: ({ context }) => ({
                ...context.loading,
                doctorAvailability: false
              })
            }),
            ({ event }) => {
              if (event.error instanceof Error && (event.error.message.includes('401') || event.error.message.toLowerCase().includes('unauthorized'))) {
                orchestrator.sendToMachine(AUTH_MACHINE_ID, { type: "LOGOUT" });
              }
              const errorMessage = event.error instanceof Error ? event.error.message : "Error al cargar disponibilidad del doctor";
              orchestrator.sendToMachine(UI_MACHINE_ID, {
                type: "OPEN_SNACKBAR",
                message: errorMessage,
                severity: "error"
              });
            }
          ],
        },
      },
    },
  },
});
