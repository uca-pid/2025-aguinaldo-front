import { createMachine, assign, fromPromise } from "xstate";
import { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { orchestrator } from "#/core/Orchestrator";
import type { TurnResponse } from "../models/Turn";
import { DATA_MACHINE_ID } from "./dataMachine";
import { UI_MACHINE_ID } from "./uiMachine";
import { TurnModifyService, type TurnModifyCreateRequest } from "../service/turn-modify-service.service";

export const MODIFY_TURNS_MACHINE_ID = "modifyTurns";

export const MODIFY_TURNS_MACHINE_EVENT_TYPES = [
  "INITIALIZE",
  "UPDATE_FORM",
  "SET_TURN_ID",
  "LOAD_TURN_DETAILS",
  "LOAD_DOCTOR_AVAILABILITY",
  "LOAD_AVAILABLE_SLOTS",
  "SUBMIT_MODIFY_REQUEST",
  "RESET"
] as const;

interface ModifyTurnsContext {
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

type ModifyTurnsEvent =
  | { type: "INITIALIZE"; turnId: string }
  | { type: "UPDATE_FORM"; key: string; value: any }
  | { type: "SET_TURN_ID"; turnId: string }
  | { type: "LOAD_TURN_DETAILS"; turnId: string }
  | { type: "LOAD_DOCTOR_AVAILABILITY"; doctorId: string; date: string }
  | { type: "LOAD_AVAILABLE_SLOTS"; doctorId: string; date: string }
  | { type: "SUBMIT_MODIFY_REQUEST" }
  | { type: "RESET" };

const initialContext: ModifyTurnsContext = {
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

export const modifyTurnsMachine = createMachine({
  id: MODIFY_TURNS_MACHINE_ID,
  types: {} as {
    context: ModifyTurnsContext;
    events: ModifyTurnsEvent;
  },
  context: initialContext,
  initial: "idle",
  states: {
    idle: {
      on: {
        INITIALIZE: {
          target: "checkingData",
          actions: assign({
            turnId: ({ event }) => event.turnId,
          }),
        },
        UPDATE_FORM: {
          actions: assign(({ event }) => {
            const key = event.key as keyof ModifyTurnsContext;
            return {
              [key]: event.value,
            } as Partial<ModifyTurnsContext>;
          }),
        },
        SET_TURN_ID: {
          actions: assign({
            turnId: ({ event }) => event.turnId,
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
        }
      }
    },

    checkingData: {
      always: [
        {
          target: "loadingMyTurns",
          guard: () => {
            const dataSnapshot = orchestrator.getSnapshot(DATA_MACHINE_ID);
            return !dataSnapshot?.context?.myTurns || dataSnapshot.context.myTurns.length === 0;
          }
        },
        {
          target: "loadingTurnDetails"
        }
      ]
    },

    loadingMyTurns: {
      invoke: {
        src: fromPromise(async () => {
          orchestrator.sendToMachine(DATA_MACHINE_ID, { type: "LOAD_MY_TURNS" });
          
          return true;
        }),
        onDone: {
          target: "waitingForTurns"
        }
      }
    },

    waitingForTurns: {
      always: [
        {
          target: "loadingTurnDetails",
          guard: () => {
            const dataSnapshot = orchestrator.getSnapshot(DATA_MACHINE_ID);
            const myTurns = dataSnapshot?.context?.myTurns || [];
            return myTurns.length > 0 && !dataSnapshot?.context?.loading?.myTurns;
          }
        }
      ],
      after: {
        5000: {
          target: "loadingTurnDetails",
          actions: () => {
            console.warn("Timeout waiting for turns to load, proceeding anyway");
          }
        }
      }
    },

    loadingTurnDetails: {
      entry: assign({ isLoadingTurnDetails: true }),
      invoke: {
        src: fromPromise(async ({ input }: { input: { turnId: string } }) => {
          const dataSnapshot = orchestrator.getSnapshot(DATA_MACHINE_ID);
          const myTurns = dataSnapshot?.context?.myTurns || [];
          
          const turn = myTurns.find((t: any) => t.id === input.turnId);
          if (turn) {
            return turn;
          }
          
          throw new Error("Turn not found in loaded turns");
        }),
        input: ({ event }) => ({
          turnId: (event as any).turnId || (event as any).turnId,
        }),
        onDone: {
          target: "loadingDoctorAvailability",
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
        src: fromPromise(async ({ input }: { input: { doctorId: string; date: string } }) => {
          const { loadDoctorAvailability } = await import("../utils/turnMachineUtils");
          return await loadDoctorAvailability({ 
            accessToken: orchestrator.getSnapshot(DATA_MACHINE_ID)?.context?.accessToken || "",
            doctorId: input.doctorId 
          });
        }),
        input: ({ context, event }) => ({
          doctorId: (event as any).doctorId || context.currentTurn?.doctorId,
          date: (event as any).date || dayjs().format('YYYY-MM-DD'),
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
        src: fromPromise(async ({ input }: { input: { doctorId: string; date: string } }) => {
          const { loadAvailableSlots } = await import("../utils/turnMachineUtils");
          return await loadAvailableSlots({ 
            accessToken: orchestrator.getSnapshot(DATA_MACHINE_ID)?.context?.accessToken || "",
            doctorId: input.doctorId,
            date: input.date
          });
        }),
        input: ({ event }) => ({
          doctorId: (event as any).doctorId,
          date: (event as any).date,
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
        src: fromPromise(async ({ input }: { input: TurnModifyCreateRequest & { accessToken: string } }) => {
          return await TurnModifyService.createModifyRequest({
            turnId: input.turnId,
            newScheduledAt: input.newScheduledAt
          }, input.accessToken);
        }),
        input: ({ context }) => ({
          turnId: context.turnId!,
          newScheduledAt: (() => {
            if (!context.selectedDate || !context.selectedTime) {
              throw new Error("Fecha y hora deben estar seleccionadas");
            }

            const timePart = context.selectedTime.split('T')[1]; 
            const dateTimeString = `${context.selectedDate.format('YYYY-MM-DD')}T${timePart}`;
            return dateTimeString;
          })(),
          accessToken: (() => {
            try {
              const dataSnapshot = orchestrator.getSnapshot(DATA_MACHINE_ID);
              return dataSnapshot?.context?.accessToken || null;
            } catch {
              return null;
            }
          })(),
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