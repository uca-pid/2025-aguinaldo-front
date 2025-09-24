import { createMachine, assign, fromPromise } from "xstate";
import { AdminService } from "../service/admin-service.service";
import { TurnService } from "../service/turn-service.service";
import { orchestrator } from "#/core/Orchestrator";
import type { PendingDoctor, AdminStats } from "../models/Admin";
import type { Doctor } from "../models/Turn";

export const DATA_MACHINE_ID = "data";
export const DATA_MACHINE_EVENT_TYPES = [
  "SET_ACCESS_TOKEN",
  "CLEAR_ACCESS_TOKEN", 
  "RELOAD_DOCTORS",
  "RELOAD_PENDING_DOCTORS", 
  "RELOAD_ADMIN_STATS",
  "RELOAD_ALL",
  "LOAD_AVAILABLE_TURNS",
  "LOAD_MY_TURNS"
];

export interface DataMachineContext {
  accessToken: string | null;
  
  doctors: Doctor[];
  pendingDoctors: PendingDoctor[];
  adminStats: AdminStats;
  availableTurns: string[];
  myTurns: any[];
  
  loading: {
    doctors: boolean;
    pendingDoctors: boolean;
    adminStats: boolean;
    availableTurns: boolean;
    myTurns: boolean;
  };
  
  errors: {
    doctors: string | null;
    pendingDoctors: string | null;
    adminStats: string | null;
    availableTurns: string | null;
    myTurns: string | null;
  };
}

export const DataMachineDefaultContext: DataMachineContext = {
  accessToken: null,
  
  doctors: [],
  pendingDoctors: [],
  adminStats: { patients: 0, doctors: 0, pending: 0 },
  availableTurns: [],
  myTurns: [],
  
  loading: {
    doctors: false,
    pendingDoctors: false,
    adminStats: false,
    availableTurns: false,
    myTurns: false,
  },
  
  errors: {
    doctors: null,
    pendingDoctors: null,
    adminStats: null,
    availableTurns: null,
    myTurns: null,
  },
};

export type DataMachineEvent =
  | { type: "SET_ACCESS_TOKEN"; accessToken: string }
  | { type: "CLEAR_ACCESS_TOKEN" }
  | { type: "RELOAD_DOCTORS" }
  | { type: "RELOAD_PENDING_DOCTORS" }
  | { type: "RELOAD_ADMIN_STATS" }
  | { type: "RELOAD_ALL" }
  | { type: "LOAD_AVAILABLE_TURNS"; doctorId: string; date: string }
  | { type: "LOAD_MY_TURNS"; status?: string };

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
        SET_ACCESS_TOKEN: {
          target: "loadingInitialData",
          actions: assign({
            accessToken: ({ event }) => event.accessToken,
          }),
        },
        CLEAR_ACCESS_TOKEN: {
          actions: assign({
            accessToken: null,
            doctors: [],
            pendingDoctors: [],
            adminStats: { patients: 0, doctors: 0, pending: 0 },
            availableTurns: [],
            myTurns: [],
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
      },
    },
    
    loadingInitialData: {
      entry: assign({
        loading: {
          doctors: true,
          pendingDoctors: true,
          adminStats: true,
          availableTurns: false,
          myTurns: false,
        },
        errors: {
          doctors: null,
          pendingDoctors: null,
          adminStats: null,
          availableTurns: null,
          myTurns: null,
        },
      }),
      invoke: [
        {
          id: "loadDoctors",
          src: fromPromise(async ({ input }: { input: { accessToken: string } }) => {
            return await TurnService.getDoctors(input.accessToken);
          }),
          input: ({ context }) => ({ accessToken: context.accessToken! }),
          onDone: {
            actions: assign({
              doctors: ({ event }) => {
                orchestrator.send({
                  type: "DATA_LOADED"
                });
                return event.output;
              },
              loading: ({ context }) => ({ ...context.loading, doctors: false }),
            }),
          },
          onError: {
            actions: assign({
              loading: ({ context }) => ({ ...context.loading, doctors: false }),
              errors: ({ context, event }) => ({ 
                ...context.errors, 
                doctors: (event.error as Error).message 
              }),
            }),
          },
        },
        {
          id: "loadPendingDoctors", 
          src: fromPromise(async ({ input }: { input: { accessToken: string } }) => {
            return await AdminService.getPendingDoctors(input.accessToken);
          }),
          input: ({ context }) => ({ accessToken: context.accessToken! }),
          onDone: {
            actions: assign({
              pendingDoctors: ({ event }) => {
                orchestrator.send({
                  type: "DATA_LOADED"
                });
                return event.output;
              },
              loading: ({ context }) => ({ ...context.loading, pendingDoctors: false }),
            }),
          },
          onError: {
            actions: assign({
              loading: ({ context }) => ({ ...context.loading, pendingDoctors: false }),
              errors: ({ context, event }) => ({ 
                ...context.errors, 
                pendingDoctors: (event.error as Error).message 
              }),
            }),
          },
        },
        {
          id: "loadAdminStats",
          src: fromPromise(async ({ input }: { input: { accessToken: string } }) => {
            return await AdminService.getAdminStats(input.accessToken);
          }),
          input: ({ context }) => ({ accessToken: context.accessToken! }),
          onDone: {
            actions: assign({
              adminStats: ({ event }) => {
                orchestrator.send({
                  type: "DATA_LOADED"
                });
                return event.output;
              },
              loading: ({ context }) => ({ ...context.loading, adminStats: false }),
            }),
          },
          onError: {
            actions: assign({
              loading: ({ context }) => ({ ...context.loading, adminStats: false }),
              errors: ({ context, event }) => ({ 
                ...context.errors, 
                adminStats: (event.error as Error).message 
              }),
            }),
          },
        },
      ],
      always: {
        target: "ready",
        guard: ({ context }) => 
          !context.loading.doctors && 
          !context.loading.pendingDoctors && 
          !context.loading.adminStats,
      },
    },
    
    ready: {
      on: {
        SET_ACCESS_TOKEN: {
          target: "loadingInitialData",
          actions: assign({
            accessToken: ({ event }) => event.accessToken,
          }),
        },
        CLEAR_ACCESS_TOKEN: {
          target: "idle",
          actions: assign({
            accessToken: null,
            doctors: [],
            pendingDoctors: [],
            adminStats: { patients: 0, doctors: 0, pending: 0 },
            availableTurns: [],
            myTurns: [],
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
      },
    },
    
    fetchingDoctors: {
      entry: assign({
        loading: ({ context }) => ({ ...context.loading, doctors: true }),
        errors: ({ context }) => ({ ...context.errors, doctors: null }),
      }),
      invoke: {
        src: fromPromise(async ({ input }: { input: { accessToken: string } }) => {
          return await TurnService.getDoctors(input.accessToken);
        }),
        input: ({ context }) => ({ accessToken: context.accessToken! }),
        onDone: {
          target: "ready",
          actions: assign({
            doctors: ({ event }) => {
              orchestrator.send({
                type: "DATA_LOADED"
              });
              return event.output;
            },
            loading: ({ context }) => ({ ...context.loading, doctors: false }),
          }),
        },
        onError: {
          target: "ready",
          actions: assign({
            loading: ({ context }) => ({ ...context.loading, doctors: false }),
            errors: ({ context, event }) => ({ 
              ...context.errors, 
              doctors: (event.error as Error).message 
            }),
          }),
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
          return await AdminService.getPendingDoctors(input.accessToken);
        }),
        input: ({ context }) => ({ accessToken: context.accessToken! }),
        onDone: {
          target: "ready",
          actions: assign({
            pendingDoctors: ({ event }) => {
              orchestrator.send({
                type: "DATA_LOADED"
              });
              return event.output;
            },
            loading: ({ context }) => ({ ...context.loading, pendingDoctors: false }),
          }),
        },
        onError: {
          target: "ready",
          actions: assign({
            loading: ({ context }) => ({ ...context.loading, pendingDoctors: false }),
            errors: ({ context, event }) => ({ 
              ...context.errors, 
              pendingDoctors: (event.error as Error).message 
            }),
          }),
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
          return await AdminService.getAdminStats(input.accessToken);
        }),
        input: ({ context }) => ({ accessToken: context.accessToken! }),
        onDone: {
          target: "ready",
          actions: assign({
            adminStats: ({ event }) => {
              orchestrator.send({
                type: "DATA_LOADED"
              });
              return event.output;
            },
            loading: ({ context }) => ({ ...context.loading, adminStats: false }),
          }),
        },
        onError: {
          target: "ready",
          actions: assign({
            loading: ({ context }) => ({ ...context.loading, adminStats: false }),
            errors: ({ context, event }) => ({ 
              ...context.errors, 
              adminStats: (event.error as Error).message 
            }),
          }),
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
          return await TurnService.getAvailableTurns(input.doctorId, input.date, input.accessToken);
        }),
        input: ({ context, event }) => ({
          accessToken: context.accessToken!,
          doctorId: (event as any).doctorId,
          date: (event as any).date
        }),
        onDone: {
          target: "ready",
          actions: assign({
            availableTurns: ({ event }) => {
              orchestrator.send({
                type: "DATA_LOADED"
              });
              return event.output;
            },
            loading: ({ context }) => ({ ...context.loading, availableTurns: false }),
          }),
        },
        onError: {
          target: "ready",
          actions: assign({
            loading: ({ context }) => ({ ...context.loading, availableTurns: false }),
            errors: ({ context, event }) => ({ 
              ...context.errors, 
              availableTurns: (event.error as Error).message 
            }),
          }),
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
          return await TurnService.getMyTurns(input.accessToken, input.status);
        }),
        input: ({ context, event }) => ({
          accessToken: context.accessToken!,
          status: (event as any).status
        }),
        onDone: {
          target: "ready",
          actions: assign({
            myTurns: ({ event }) => {
              orchestrator.send({
                type: "DATA_LOADED"
              });
              return event.output;
            },
            loading: ({ context }) => ({ ...context.loading, myTurns: false }),
          }),
        },
        onError: {
          target: "ready",
          actions: assign({
            loading: ({ context }) => ({ ...context.loading, myTurns: false }),
            errors: ({ context, event }) => ({ 
              ...context.errors, 
              myTurns: (event.error as Error).message 
            }),
          }),
        },
      },
    },
  },
});
