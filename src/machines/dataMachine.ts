import { createMachine, assign, fromPromise } from "xstate";
import { loadDoctors, loadPendingDoctors, loadAdminStats, loadAvailableTurns, loadMyTurns, loadDoctorModifyRequests, loadMyModifyRequests } from "../utils/MachineUtils/dataMachineUtils";
import { loadDoctorPatients, loadDoctorAvailability } from "../utils/MachineUtils/doctorMachineUtils";
import { orchestrator } from "#/core/Orchestrator";
import type { PendingDoctor, AdminStats } from "../models/Admin";
import type { Doctor } from "../models/Turn";
import { UI_MACHINE_ID } from "./uiMachine";
import { AUTH_MACHINE_ID } from "./authMachine";
import { TurnModifyRequest } from "#/models/TurnModifyRequest";

export const DATA_MACHINE_ID = "data";
export const DATA_MACHINE_EVENT_TYPES = [
  "SET_AUTH",
  "CLEAR_ACCESS_TOKEN", 
  "RELOAD_DOCTORS",
  "RELOAD_PENDING_DOCTORS", 
  "RELOAD_ADMIN_STATS",
  "LOAD_AVAILABLE_TURNS",
  "LOAD_MY_TURNS",
  "LOAD_DOCTOR_PATIENTS",
  "LOAD_DOCTOR_AVAILABILITY",
  "LOAD_DOCTOR_MODIFY_REQUESTS",
  "LOAD_MY_MODIFY_REQUESTS"
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
  doctorModifyRequests: TurnModifyRequest[];
  myModifyRequests: TurnModifyRequest[];
  
  loading: {
    doctors: boolean;
    pendingDoctors: boolean;
    adminStats: boolean;
    availableTurns: boolean;
    myTurns: boolean;
    doctorPatients: boolean;
    doctorAvailability: boolean;
    doctorModifyRequests: boolean;
    myModifyRequests: boolean;
  };
  
  errors: {
    doctors: string | null;
    pendingDoctors: string | null;
    adminStats: string | null;
    availableTurns: string | null;
    myTurns: string | null;
    doctorPatients: string | null;
    doctorAvailability: string | null;
    doctorModifyRequests: string | null;
    myModifyRequests: string | null;
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
  doctorModifyRequests: [],
  myModifyRequests: [],
  
  loading: {
    doctors: false,
    pendingDoctors: false,
    adminStats: false,
    availableTurns: false,
    myTurns: false,
    doctorPatients: false,
    doctorAvailability: false,
    doctorModifyRequests: false,
    myModifyRequests: false,
  },
  
  errors: {
    doctors: null,
    pendingDoctors: null,
    adminStats: null,
    availableTurns: null,
    myTurns: null,
    doctorPatients: null,
    doctorAvailability: null,
    doctorModifyRequests: null,
    myModifyRequests: null,
  },
};

export type DataMachineEvent =
  | { type: "SET_AUTH"; accessToken: string; userId: string; userRole: string; doctorId?: string }
  | { type: "CLEAR_ACCESS_TOKEN" }
  | { type: "RELOAD_DOCTORS" }
  | { type: "RELOAD_PENDING_DOCTORS" }
  | { type: "RELOAD_ADMIN_STATS" }
  | { type: "LOAD_AVAILABLE_TURNS"; doctorId: string; date: string }
  | { type: "LOAD_MY_TURNS"; status?: string }
  | { type: "LOAD_DOCTOR_PATIENTS" }
  | { type: "LOAD_DOCTOR_AVAILABILITY"; doctorId?: string }
  | { type: "LOAD_DOCTOR_MODIFY_REQUESTS"; doctorId?: string }
  | { type: "LOAD_MY_MODIFY_REQUESTS" };

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
          target: "fetchingDoctors",
          actions: assign({
            accessToken: ({ event }) => event.accessToken,
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
            doctorModifyRequests: [],
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
        LOAD_AVAILABLE_TURNS: {
          target: "fetchingAvailableTurns",
          guard: ({ context, event }) => !!context.accessToken && !!(event as any).doctorId && !!(event as any).date,
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
        LOAD_DOCTOR_MODIFY_REQUESTS: {
          target: "fetchingDoctorModifyRequests",
          guard: ({ context }) => !!context.accessToken,
        },
        LOAD_MY_MODIFY_REQUESTS: {
          target: "fetchingMyModifyRequests",
          guard: ({ context }) => !!context.accessToken,
        },
      },
    },
    
    ready: {
      entry: ({ context }) => {
        setTimeout(() => {
          orchestrator.send({
            type: "DATA_LOADED",
            doctorAvailability: context.doctorAvailability
          });
          orchestrator.sendToMachine("notification", {
            type: "LOAD_NOTIFICATIONS",
            accessToken: context.accessToken!
          });
        }, 0);
      },
      exit: () => {
        orchestrator.send({
          type: "LOADING"
        });
      },
      on: {
        SET_AUTH: {
          target: "fetchingDoctors",
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
            doctorModifyRequests: [],
            myModifyRequests: [],
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
        LOAD_AVAILABLE_TURNS: {
          target: "fetchingAvailableTurns",
          guard: ({ context, event }) => !!context.accessToken && !!(event as any).doctorId && !!(event as any).date,
        },
        LOAD_MY_TURNS: {
          target: "fetchingMyTurns",
          guard: ({ context }) => !!context.accessToken,
        },
        LOAD_DOCTOR_PATIENTS: {
          target: "fetchingDoctorPatients",
        },
        LOAD_DOCTOR_AVAILABILITY: {
          target: "fetchingDoctorAvailability",
        },
        LOAD_DOCTOR_MODIFY_REQUESTS: {
          target: "fetchingDoctorModifyRequests",
        },
        LOAD_MY_MODIFY_REQUESTS: {
          target: "fetchingMyModifyRequests",
          guard: ({ context }) => !!context.accessToken,
        },
      },
    },
    fetchingDoctors: {
      entry: [
        () => orchestrator.send({ type: "LOADING" }),
        assign({
          loading: ({ context }) => ({ ...context.loading, doctors: true }),
          errors: ({ context }) => ({ ...context.errors, doctors: null }),
        })
      ],
      invoke: {
        src: fromPromise(async ({ input }: { input: { accessToken: string } }) => {
          return await loadDoctors(input);
        }),
        input: ({ context }) => ({ accessToken: context.accessToken! }),
        onDone: [
          {
            target: "fetchingPendingDoctors",
            guard: ({ context }) => context.userRole === "ADMIN",
            actions: assign({
              doctors: ({ event }) => event.output,
              loading: ({ context }) => ({ ...context.loading, doctors: false }),
            }),
          },
          {
            target: "fetchingMyTurns",
            guard: ({ context }) => context.userRole === "DOCTOR" || context.userRole === "PATIENT",
            actions: assign({
              doctors: ({ event }) => event.output,
              loading: ({ context }) => ({ ...context.loading, doctors: false }),
            }),
          },
          {
            target: "ready",
            actions: assign({
              doctors: ({ event }) => event.output,
              loading: ({ context }) => ({ ...context.loading, doctors: false }),
            }),
          },
        ],
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
          target: "fetchingAdminStats",
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
          const result = await loadAvailableTurns(input);
          return result;
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
      on: {
        LOAD_MY_TURNS: {
          target: "fetchingMyTurns",
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
        onDone: [
          {
            target: "fetchingDoctorPatients",
            guard: ({ context }) => context.userRole === "DOCTOR",
            actions: assign({
              myTurns: ({ event }) => event.output,
              loading: ({ context }) => ({ ...context.loading, myTurns: false }),
            }),
          },
          {
            target: "fetchingMyModifyRequests",
            guard: ({ context }) => context.userRole === "PATIENT",
            actions: assign({
              myTurns: ({ event }) => event.output,
              loading: ({ context }) => ({ ...context.loading, myTurns: false }),
            }),
          },
          {
            target: "ready",
            actions: assign({
              myTurns: ({ event }) => event.output,
              loading: ({ context }) => ({ ...context.loading, myTurns: false }),
            }),
          },
        ],
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
          target: "fetchingDoctorAvailability",
          actions: assign({
            doctorPatients: ({ event }) => event.output,
            loading: ({ context }) => ({ ...context.loading, doctorPatients: false }),
          }),
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
        input: ({ context, event }) => ({ 
          accessToken: context.accessToken!,
          doctorId: (event as any).doctorId || context.doctorId!
        }),
        onDone: {
          target: "fetchingDoctorModifyRequests",
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

    fetchingDoctorModifyRequests: {
      entry: [
        assign({
          loading: ({ context }) => ({ ...context.loading, doctorModifyRequests: true }),
          errors: ({ context }) => ({ ...context.errors, doctorModifyRequests: null }),
        })
      ],
      invoke: {
        src: fromPromise(async ({ input }: { input: { accessToken: string; doctorId: string } }) => {
          return await loadDoctorModifyRequests(input);
        }),
        input: ({ context, event }) => ({
          accessToken: context.accessToken!,
          doctorId: (event as any).doctorId || context.doctorId!
        }),
        onDone: {
          target: "ready",
          actions: assign({
            doctorModifyRequests: ({ event }) => event.output,
            loading: ({ context }) => ({ ...context.loading, doctorModifyRequests: false }),
          }),
        },
        onError: {
          target: "idle",
          actions: [
            assign({
              errors: ({ context, event }) => ({
                ...context.errors,
                doctorModifyRequests: event.error instanceof Error ? event.error.message : "Error al cargar solicitudes de modificación"
              }),
              loading: ({ context }) => ({
                ...context.loading,
                doctorModifyRequests: false
              })
            }),
            ({ event }) => {
              if (event.error instanceof Error && (event.error.message.includes('401') || event.error.message.toLowerCase().includes('unauthorized'))) {
                orchestrator.sendToMachine(AUTH_MACHINE_ID, { type: "LOGOUT" });
              }
              const errorMessage = event.error instanceof Error ? event.error.message : "Error al cargar solicitudes de modificación";
              orchestrator.sendToMachine(UI_MACHINE_ID, {
                type: "OPEN_SNACKBAR",
                message: errorMessage,
                severity: "error"
              });
            }
          ],
        },
      },
      on: {
        LOAD_MY_TURNS: {
          target: "fetchingMyTurns",
        },
      },
    },
    
    fetchingMyModifyRequests: {
      entry: [
        assign({
          loading: ({ context }) => ({ ...context.loading, myModifyRequests: true }),
          errors: ({ context }) => ({ ...context.errors, myModifyRequests: null }),
        })
      ],
      invoke: {
        src: fromPromise(async ({ input }: { input: { accessToken: string } }) => {
          return await loadMyModifyRequests(input);
        }),
        input: ({ context }) => ({ accessToken: context.accessToken! }),
        onDone: {
          target: "ready",
          actions: assign({
            myModifyRequests: ({ event }) => event.output,
            loading: ({ context }) => ({ ...context.loading, myModifyRequests: false }),
          }),
        },
        onError: {
          target: "idle",
          actions: [
            assign({
              errors: ({ context, event }) => ({
                ...context.errors,
                myModifyRequests: event.error instanceof Error ? event.error.message : "Error al cargar mis solicitudes de modificación"
              }),
              loading: ({ context }) => ({
                ...context.loading,
                myModifyRequests: false
              })
            }),
            ({ event }) => {
              if (event.error instanceof Error && (event.error.message.includes('401') || event.error.message.toLowerCase().includes('unauthorized'))) {
                orchestrator.sendToMachine(AUTH_MACHINE_ID, { type: "LOGOUT" });
              }
              const errorMessage = event.error instanceof Error ? event.error.message : "Error al cargar mis solicitudes de modificación";
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
