import { createMachine, assign, fromPromise } from "xstate";
import { loadDoctors, loadPendingDoctors, loadAdminStats, loadAvailableTurns, loadMyTurns, loadDoctorModifyRequests, loadMyModifyRequests, loadTurnFiles } from "../utils/MachineUtils/dataMachineUtils";
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
  "RELOAD_ALL",
  "LOAD_AVAILABLE_TURNS",
  "LOAD_MY_TURNS",
  "LOAD_DOCTOR_PATIENTS",
  "LOAD_DOCTOR_AVAILABILITY",
  "LOAD_DOCTOR_MODIFY_REQUESTS",
  "LOAD_MY_MODIFY_REQUESTS",
  "LOAD_TURN_FILES",
  "UPDATE_TURN_FILE",
  "REMOVE_TURN_FILE"
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
  turnFiles: Record<string, any>;
  
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
    turnFiles: boolean;
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
    turnFiles: string | null;
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
  turnFiles: {},
  
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
    turnFiles: false,
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
    turnFiles: null,
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
  | { type: "LOAD_DOCTOR_AVAILABILITY"; doctorId?: string }
  | { type: "LOAD_DOCTOR_MODIFY_REQUESTS"; doctorId?: string }
  | { type: "LOAD_MY_MODIFY_REQUESTS" }
  | { type: "LOAD_TURN_FILES" }
  | { type: "UPDATE_TURN_FILE"; turnId: string; fileInfo: any }
  | { type: "REMOVE_TURN_FILE"; turnId: string };

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
        RELOAD_ALL: {
          target: "loadingInitialData",
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
      },
    },
    
    loadingInitialData: {
      entry: assign(({ context }) => {
        orchestrator.send({ type: "LOADING" });
        const isAdmin = context.userRole === "ADMIN";
        const isDoctor = context.userRole === "DOCTOR";
        const isPatient = context.userRole === "PATIENT";
        
        return {
          loading: {
            doctors: true,
            pendingDoctors: isAdmin,
            adminStats: isAdmin,
            availableTurns: false,
            myTurns: isPatient || isDoctor,
            doctorPatients: isDoctor,
            doctorAvailability: isDoctor,
            doctorModifyRequests: isDoctor,
            myModifyRequests: isPatient,
            turnFiles: false,
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
            turnFiles: null,
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
          id: "loadDoctorModifyRequests",
          src: fromPromise(async ({ input }: { input: { accessToken: string; isDoctor: boolean; doctorId: string | null } }) => {
            if (!input.isDoctor || !input.doctorId) return [];
            return await loadDoctorModifyRequests({ accessToken: input.accessToken, doctorId: input.doctorId });
          }),
          input: ({ context }) => ({
            accessToken: context.accessToken!,
            isDoctor: context.userRole === "DOCTOR",
            doctorId: context.doctorId
          }),
          onDone: {
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
                  doctorModifyRequests: event.error instanceof Error ? event.error.message : "Error al cargar solicitudes de modificación del doctor"
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
                const errorMessage = event.error instanceof Error ? event.error.message : "Error al cargar solicitudes de modificación del doctor";
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
            
            const result = await loadMyTurns({ accessToken: input.accessToken });
            return result;
          }),
          input: ({ context }) => ({ 
            accessToken: context.accessToken!, 
            isPatient: context.userRole === "PATIENT",
            isDoctor: context.userRole === "DOCTOR"
          }),
          onDone: {
            actions: [
              assign({
                myTurns: ({ event }) => event.output,
                loading: ({ context }) => ({ ...context.loading, myTurns: false }),
              }),
            ],
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
        {
          id: "loadDoctorPatients",
          src: fromPromise(async ({ input }: { input: { accessToken: string; isDoctor: boolean; doctorId: string | null } }) => {
            if (!input.isDoctor || !input.doctorId) {
              return [];
            }
            return await loadDoctorPatients({ accessToken: input.accessToken, doctorId: input.doctorId });
          }),
          input: ({ context }) => ({
            accessToken: context.accessToken!,
            isDoctor: context.userRole === "DOCTOR",
            doctorId: context.doctorId
          }),
          onDone: {
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
        {
          id: "loadMyModifyRequests",
          src: fromPromise(async ({ input }: { input: { accessToken: string; isPatient: boolean } }) => {
            if (!input.isPatient) return [];
            return await loadMyModifyRequests({ accessToken: input.accessToken });
          }),
          input: ({ context }) => ({
            accessToken: context.accessToken!,
            isPatient: context.userRole === "PATIENT"
          }),
          onDone: {
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
        }
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
                 (!isDoctor || !context.loading.doctorPatients) &&
                 (!isDoctor || !context.loading.doctorModifyRequests) &&
                 (!isPatient || !context.loading.myModifyRequests) &&
                 (!(isPatient || isDoctor) || !context.loading.myTurns);
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
          
          if ((context.userRole === "PATIENT" || context.userRole === "DOCTOR") && 
              context.myTurns?.length > 0 && 
              Object.keys(context.turnFiles).length === 0) {
            orchestrator.sendToMachine("data", { type: "LOAD_TURN_FILES" });
          }
        }, 0);
      },
      exit: () => {
        orchestrator.send({
          type: "LOADING"
        });
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
            doctorModifyRequests: [],
            myModifyRequests: [],
            turnFiles: {},
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
        LOAD_TURN_FILES: {
          target: "fetchingTurnFiles",
          guard: ({ context }) => {
            const canLoad = !!context.accessToken && (context.userRole === "PATIENT" || context.userRole === "DOCTOR");
            return canLoad;
          },
        },
        UPDATE_TURN_FILE: {
          actions: assign({
            turnFiles: ({ context, event }) => {
              const newTurnFiles = {
                ...context.turnFiles,
                [(event as any).turnId]: (event as any).fileInfo
              };
              return newTurnFiles;
            }
          })
        },
        REMOVE_TURN_FILE: {
          actions: assign({
            turnFiles: ({ context, event }) => {
              const newTurnFiles = { ...context.turnFiles };
              delete newTurnFiles[(event as any).turnId];
              return newTurnFiles;
            }
          })
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
        onDone: {
          target: "ready",
          actions: [
            assign({
              myTurns: ({ event }) => event.output,
              loading: ({ context }) => ({ ...context.loading, myTurns: false }),
            }),
            ({ context }) => {
              if (context.userRole === "PATIENT") {
                orchestrator.sendToMachine("data", { type: "LOAD_MY_MODIFY_REQUESTS" });
              }
            }
          ],
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
        input: ({ context, event }) => ({ 
          accessToken: context.accessToken!,
          doctorId: (event as any).doctorId || context.doctorId!
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
          actions: [
            assign({
              doctorModifyRequests: ({ event }) => event.output,
              loading: ({ context }) => ({ ...context.loading, doctorModifyRequests: false }),
            }),
            ({ context, self }) => {
              if (context.doctorPatients.length === 0 && !context.loading.doctorPatients) {
                self.send({ type: "LOAD_DOCTOR_PATIENTS" });
              }
            }
          ],
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
          actions: [
            assign({
              myModifyRequests: ({ event }) => event.output,
              loading: ({ context }) => ({ ...context.loading, myModifyRequests: false }),
            })
          ],
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
    fetchingTurnFiles: {
      entry: assign({
        loading: ({ context }) => {
          return { ...context.loading, turnFiles: true };
        },
        errors: ({ context }) => ({ ...context.errors, turnFiles: null }),
      }),
      invoke: {
        src: fromPromise(async ({ input }: { input: { accessToken: string; turnIds: string[] } }) => {
          return await loadTurnFiles({ accessToken: input.accessToken, turnIds: input.turnIds });
        }),
        input: ({ context }) => {
          const validTurns = context.myTurns?.filter((turn: any) => 
            turn.status !== 'CANCELED' && turn.status !== 'CANCELLED'
          ) || [];
          
          const input = {
            accessToken: context.accessToken!,
            turnIds: validTurns.map((turn: any) => turn.id)
          };
          return input;
        },
        onDone: {
          target: "ready",
          actions: assign({
            turnFiles: ({ context, event }) => {
              return { ...context.turnFiles, ...event.output };
            },
            loading: ({ context }) => ({ ...context.loading, turnFiles: false }),
          }),
        },
        onError: {
          target: "ready",
          actions: [
            assign({
              loading: ({ context }) => {
                return { ...context.loading, turnFiles: false };
              },
              errors: ({ context, event }) => {
                console.error('❌ fetchingTurnFiles: Error occurred:', event.error);
                return {
                  ...context.errors,
                  turnFiles: event.error instanceof Error ? event.error.message : "Error al cargar archivos de turnos"
                };
              }
            }),
            ({ event }) => {
              if (event.error instanceof Error && (event.error.message.includes('401') || event.error.message.toLowerCase().includes('unauthorized'))) {
                orchestrator.sendToMachine(AUTH_MACHINE_ID, { type: "LOGOUT" });
              }
              const errorMessage = event.error instanceof Error ? event.error.message : "Error al cargar archivos de turnos";
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
