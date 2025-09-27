import { createMachine, assign, fromPromise } from "xstate";
import { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { orchestrator } from "#/core/Orchestrator";
import type { TurnResponse } from "../models/Turn";
import { DATA_MACHINE_ID } from "./dataMachine";
import { UI_MACHINE_ID } from "./uiMachine";

export const MODIFY_TURN_MACHINE_ID = "modifyTurn";

export const MODIFY_TURN_MACHINE_EVENT_TYPES = [
  "UPDATE_FORM",
  "LOAD_TURN_DETAILS",
  "LOAD_DOCTOR_AVAILABILITY", 
  "LOAD_AVAILABLE_SLOTS",
  "SUBMIT_MODIFY_REQUEST",
  "RESET",
  "DATA_LOADED"
] as const;

interface ModifyTurnContext {
  accessToken: string | null;
  turnId: string | null;
  currentTurn: TurnResponse | null;
  selectedDate: Dayjs | null;
  selectedTime: string | null;
  availableSlots: string[];
  availableDates: string[];
  reason: string;
  isLoadingTurnDetails: boolean;
  isLoadingAvailableSlots: boolean;
  isModifyingTurn: boolean;
  modifyError: string | null;
}

type ModifyTurnEvent =
  | { type: "UPDATE_FORM"; key: string; value: any }
  | { type: "LOAD_TURN_DETAILS"; turnId: string }
  | { type: "LOAD_DOCTOR_AVAILABILITY"; doctorId: string; date: string }
  | { type: "LOAD_AVAILABLE_SLOTS"; doctorId: string; date: string }
  | { type: "SUBMIT_MODIFY_REQUEST" }
  | { type: "RESET" }
  | { type: "DATA_LOADED" };

const initialContext: ModifyTurnContext = {
  accessToken: null,
  turnId: null,
  currentTurn: null,
  selectedDate: null,
  selectedTime: null,
  availableSlots: [],
  availableDates: [],
  reason: "",
  isLoadingTurnDetails: false,
  isLoadingAvailableSlots: false,
  isModifyingTurn: false,
  modifyError: null,
};

export const modifyTurnMachine = createMachine({
  id: MODIFY_TURN_MACHINE_ID,
  types: {} as {
    context: ModifyTurnContext;
    events: ModifyTurnEvent;
  },
  context: initialContext,
  initial: "idle",
  states: {
    idle: {
      on: {
        UPDATE_FORM: {
          actions: assign(({ event }) => {
            const key = event.key as keyof ModifyTurnContext;
            return {
              [key]: event.value,
            } as Partial<ModifyTurnContext>;
          }),
        },
        LOAD_TURN_DETAILS: {
          target: "loadingTurnDetails",
          actions: assign({
            turnId: ({ event }) => event.turnId,
          }),
        },
        LOAD_DOCTOR_AVAILABILITY: {
          target: "loadingDoctorAvailability"
        },
        LOAD_AVAILABLE_SLOTS: {
          target: "loadingAvailableSlots"
        },
        SUBMIT_MODIFY_REQUEST: {
          target: "submittingModifyRequest"
        },
        RESET: {
          actions: assign(initialContext)
        },
        DATA_LOADED: {
          actions: assign({
            accessToken: () => {
              try {
                const dataSnapshot = orchestrator.getSnapshot(DATA_MACHINE_ID);
                return dataSnapshot?.context?.accessToken || null;
              } catch {
                return null;
              }
            }
          })
        }
      }
    },

    loadingTurnDetails: {
      entry: assign({ isLoadingTurnDetails: true }),
      invoke: {
        src: fromPromise(async ({ input }: { input: { turnId: string; accessToken: string } }) => {
          const { loadTurnDetails } = await import("../utils/turnMachineUtils");
          return await loadTurnDetails({ turnId: input.turnId, accessToken: input.accessToken });
        }),
        input: ({ context, event }) => ({
          turnId: (event as any).turnId,
          accessToken: context.accessToken!,
        }),
        onDone: {
          target: "idle",
          actions: [
            assign({
              isLoadingTurnDetails: false,
              currentTurn: ({ event }) => event.output
            })
          ]
        },
        onError: {
          target: "idle",
          actions: [
            assign({
              isLoadingTurnDetails: false,
              modifyError: ({ event }) => (event.error as Error)?.message || "Error cargando detalles del turno"
            }),
            () => {
              orchestrator.sendToMachine(UI_MACHINE_ID, {
                type: "OPEN_SNACKBAR",
                message: "Error cargando detalles del turno",
                severity: "error"
              });
            }
          ]
        }
      }
    },

    loadingDoctorAvailability: {
      invoke: {
        src: fromPromise(async ({ input }: { input: { doctorId: string; date: string; accessToken: string } }) => {
          const { loadDoctorAvailability } = await import("../utils/turnMachineUtils");
          return await loadDoctorAvailability(input);
        }),
        input: ({ context, event }) => ({
          doctorId: (event as any).doctorId,
          date: (event as any).date,
          accessToken: context.accessToken!,
        }),
        onDone: {
          target: "idle",
          actions: [
            assign({
              availableDates: ({ event }) => event.output
            })
          ]
        },
        onError: {
          target: "idle",
          actions: [
            assign({
              modifyError: ({ event }) => (event.error as Error)?.message || "Error cargando disponibilidad del doctor"
            }),
            () => {
              orchestrator.sendToMachine(UI_MACHINE_ID, {
                type: "OPEN_SNACKBAR",
                message: "Error cargando disponibilidad del doctor",
                severity: "error"
              });
            }
          ]
        }
      }
    },

    loadingAvailableSlots: {
      entry: assign({ isLoadingAvailableSlots: true }),
      invoke: {
        src: fromPromise(async ({ input }: { input: { doctorId: string; date: string; accessToken: string } }) => {
          const { loadAvailableSlots } = await import("../utils/turnMachineUtils");
          return await loadAvailableSlots(input);
        }),
        input: ({ context, event }) => ({
          doctorId: (event as any).doctorId,
          date: (event as any).date,
          accessToken: context.accessToken!,
        }),
        onDone: {
          target: "idle",
          actions: [
            assign({
              isLoadingAvailableSlots: false,
              availableSlots: ({ event }) => event.output
            })
          ]
        },
        onError: {
          target: "idle",
          actions: [
            assign({
              isLoadingAvailableSlots: false,
              modifyError: ({ event }) => (event.error as Error)?.message || "Error cargando horarios disponibles"
            }),
            () => {
              orchestrator.sendToMachine(UI_MACHINE_ID, {
                type: "OPEN_SNACKBAR",
                message: "Error cargando horarios disponibles",
                severity: "error"
              });
            }
          ]
        }
      }
    },

    submittingModifyRequest: {
      entry: assign({ isModifyingTurn: true }),
      invoke: {
        src: fromPromise(async ({ input }: { input: { turnId: string; newScheduledAt: string; reason: string; accessToken: string } }) => {
          const { createModifyTurnRequest } = await import("../utils/turnMachineUtils");
          return await createModifyTurnRequest(input);
        }),
        input: ({ context }) => ({
          turnId: context.turnId!,
          newScheduledAt: `${context.selectedDate!.format('YYYY-MM-DD')}T${dayjs(context.selectedTime).format('HH:mm:ss')}${dayjs(context.selectedTime).format('Z')}`,
          reason: context.reason,
          accessToken: context.accessToken!,
        }),
        onDone: {
          target: "idle",
          actions: [
            assign({
              isModifyingTurn: false,
              modifyError: null
            }),
            () => {
              orchestrator.sendToMachine(DATA_MACHINE_ID, { type: "LOAD_MY_TURNS" });
              orchestrator.sendToMachine(UI_MACHINE_ID, {
                type: "OPEN_SNACKBAR",
                message: "Solicitud de modificación enviada exitosamente",
                severity: "success"
              });
              orchestrator.sendToMachine(UI_MACHINE_ID, { type: "NAVIGATE", to: "/patient/view-turns" });
            }
          ]
        },
        onError: {
          target: "idle",
          actions: [
            assign({
              isModifyingTurn: false,
              modifyError: ({ event }) => (event.error as Error)?.message || "Error enviando solicitud de modificación"
            }),
            () => {
              orchestrator.sendToMachine(UI_MACHINE_ID, {
                type: "OPEN_SNACKBAR",
                message: "Error enviando solicitud de modificación",
                severity: "error"
              });
            }
          ]
        }
      }
    }
  }
});