import { createMachine, assign, fromPromise } from "xstate";
import { loadDoctors, loadPendingDoctors, loadAdminStats, loadAvailableTurns, loadMyTurns } from "../utils/dataMachineUtils";
import { loadDoctorPatients, loadDoctorAvailability } from "../utils/doctorMachineUtils";
import { orchestrator } from "#/core/Orchestrator";
import type { PendingDoctor, AdminStats } from "../models/Admin";
import type { Doctor } from "../models/Turn";

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
  "LOAD_DOCTOR_AVAILABILITY"
];

export interface DataMachineContext {
  accessToken: string | null;
  userRole: string | null;
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
  | { type: "LOAD_DOCTOR_AVAILABILITY" };

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
            accessToken: ({ event }) => event.accessToken,
            userRole: ({ event }) => event.userRole,
            doctorId: ({ event }) => event.userRole === "DOCTOR" ? event.userId : null,
          }),
        },
        CLEAR_ACCESS_TOKEN: {
          actions: assign({
            accessToken: null,
            userRole: null,
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
      },
    },
    
    loadingInitialData: {
      entry: assign(({ context }) => {
        const isAdmin = context.userRole === "ADMIN";
        const isDoctor = context.userRole === "DOCTOR";
        return {
          loading: {
            doctors: true,
            pendingDoctors: isAdmin,
            adminStats: isAdmin,
            availableTurns: false,
            myTurns: false,
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
            actions: assign({
              loading: ({ context }) => ({ ...context.loading, adminStats: false }),
              errors: ({ context, event }) => ({ 
                ...context.errors, 
                adminStats: (event.error as Error).message 
              }),
            }),
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
            actions: assign({
              loading: ({ context }) => ({ ...context.loading, doctorAvailability: false }),
              errors: ({ context, event }) => ({ 
                ...context.errors, 
                doctorAvailability: (event.error as Error).message 
              }),
            }),
          },
        },
      ],
      always: {
        target: "ready",
        guard: ({ context }) => {
          const isAdmin = context.userRole === "ADMIN";
          const isDoctor = context.userRole === "DOCTOR";
          return !context.loading.doctors && 
                 (!isAdmin || !context.loading.pendingDoctors) && 
                 (!isAdmin || !context.loading.adminStats) &&
                 (!isDoctor || !context.loading.doctorAvailability);
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
            doctorId: ({ event }) => event.userRole === "DOCTOR" ? event.userId : null,
          }),
        },
        CLEAR_ACCESS_TOKEN: {
          target: "idle",
          actions: assign({
            accessToken: null,
            userRole: null,
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
          doctorId: context.accessToken! // This should come from auth context - needs to be fixed
        }),
        onDone: {
          target: "ready",
          actions: assign({
            doctorPatients: ({ event }) => event.output,
            loading: ({ context }) => ({ ...context.loading, doctorPatients: false }),
          }),
        },
        onError: {
          target: "ready",
          actions: assign({
            loading: ({ context }) => ({ ...context.loading, doctorPatients: false }),
            errors: ({ context, event }) => ({ 
              ...context.errors, 
              doctorPatients: (event.error as Error).message 
            }),
          }),
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
          doctorId: context.accessToken! // This should come from auth context - needs to be fixed
        }),
        onDone: {
          target: "ready",
          actions: assign({
            doctorAvailability: ({ event }) => event.output,
            loading: ({ context }) => ({ ...context.loading, doctorAvailability: false }),
          }),
        },
        onError: {
          target: "ready",
          actions: assign({
            loading: ({ context }) => ({ ...context.loading, doctorAvailability: false }),
            errors: ({ context, event }) => ({ 
              ...context.errors, 
              doctorAvailability: (event.error as Error).message 
            }),
          }),
        },
      },
    },
  },
});
