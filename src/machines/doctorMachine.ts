import { createMachine, assign, fromPromise } from "xstate";
import { DoctorService } from "../service/doctor-service.service";
import type { Patient } from "../models/Doctor";

export interface DoctorMachineContext {
  patients: Patient[];
  isLoadingPatients: boolean;
  patientsError: string | null;
  accessToken: string | null;
  doctorId: string | null;
}

export type DoctorMachineEvent =
  | { type: "LOAD_PATIENTS" }
  | { type: "SET_AUTH"; accessToken: string; doctorId: string }
  | { type: "RETRY" }
  | { type: "RESET" };

const doctorMachine = createMachine({
  id: "doctor",

  context: {
    patients: [],
    isLoadingPatients: false,
    patientsError: null,
    accessToken: null,
    doctorId: null,
  } as DoctorMachineContext,

  initial: "idle",

  states: {
    idle: {
      on: {
        LOAD_PATIENTS: {
          target: "loadingPatients",
          guard: ({ context }) => !!context.accessToken && !!context.doctorId,
        },
        SET_AUTH: {
          actions: assign({
            accessToken: ({ event }) => event.accessToken,
            doctorId: ({ event }) => event.doctorId,
          }),
        },
      },
    },

    loadingPatients: {
      entry: assign({
        isLoadingPatients: true,
        patientsError: null,
      }),

      invoke: {
        src: fromPromise(async ({ input }: { input: { accessToken: string; doctorId: string } }) => {
          return await DoctorService.getDoctorPatients(input.accessToken, input.doctorId);
        }),

        input: ({ context }) => ({
          accessToken: context.accessToken!,
          doctorId: context.doctorId!,
        }),

        onDone: {
          target: "success",
          actions: assign({
            patients: ({ event }) => event.output,
            isLoadingPatients: false,
            patientsError: null,
          }),
        },

        onError: {
          target: "error",
          actions: assign({
            isLoadingPatients: false,
            patientsError: "Error al cargar pacientes",
          }),
        },
      },
    },

    success: {
      on: {
        LOAD_PATIENTS: "loadingPatients",
        RETRY: "loadingPatients",
      },
    },

    error: {
      on: {
        RETRY: "loadingPatients",
        RESET: {
          target: "idle",
          actions: assign({
            patients: [],
            patientsError: null,
          }),
        },
      },
    },
  },

  on: {
    SET_AUTH: {
      actions: assign({
        accessToken: ({ event }) => event.accessToken,
        doctorId: ({ event }) => event.doctorId,
      }),
    },
  },
});

export default doctorMachine;