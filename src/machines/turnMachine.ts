import { createMachine, assign, fromPromise } from "xstate";
import { Dayjs } from "dayjs";
import { reserveTurn, createTurn, cancelTurn } from "../utils/turnMachineUtils";
import { orchestrator } from "#/core/Orchestrator";
import type { Doctor, TurnResponse } from "../models/Turn";
import { DATA_MACHINE_ID } from "./dataMachine";

export const TURN_MACHINE_ID = "turn";
export const TURN_MACHINE_EVENT_TYPES = [
  "UPDATE_FORM_TAKE_TURN",
  "UPDATE_FORM_SHOW_TURNS",
  "NEXT",
  "BACK",
  "RESET_TAKE_TURN",
  "RESET_SHOW_TURNS",
  "DATA_LOADED",
  "RESERVE_TURN",
  "CREATE_TURN",
  "CANCEL_TURN",
  "CLEAR_CANCEL_SUCCESS",
];

export interface TurnMachineContext {
  doctors: Doctor[];
  availableTurns: string[];
  myTurns: TurnResponse[];
  
  isCreatingTurn: boolean;
  isReservingTurn: boolean;
  isCancellingTurn: boolean;
  cancellingTurnId: string | null;
  
  error: string | null;
  reserveError: string | null;
  cancelSuccess: string | null;
  
  takeTurn: {
    professionSelected: string;
    profesionalSelected: string;
    doctorId: string;
    dateSelected: Dayjs | null;
    timeSelected: Dayjs | null;
    scheduledAt: string | null;
    reason: string;
  };
  showTurns: {
    dateSelected: Dayjs | null;
    statusFilter: string;
  };
  
  accessToken: string | null;
  userId: string | null;
}

export type TurnMachineEvent =
  | { type: "UPDATE_FORM_TAKE_TURN"; key: string; value: any }
  | { type: "UPDATE_FORM_SHOW_TURNS"; key: string; value: any }
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "RESET_TAKE_TURN" }
  | { type: "RESET_SHOW_TURNS" }
  | { type: "DATA_LOADED" }
  | { type: "RESERVE_TURN"; turnId: string }
  | { type: "CREATE_TURN" }
  | { type: "CANCEL_TURN"; turnId: string }
  | { type: "CLEAR_CANCEL_SUCCESS" }

export const turnMachine = createMachine({
  id: "turnMachine",
  type: "parallel", 
  context: {
    doctors: [],
    availableTurns: [],
    myTurns: [],
    
    isCreatingTurn: false,
    isReservingTurn: false,
    isCancellingTurn: false,
    cancellingTurnId: null,
    
    error: null,
    reserveError: null,
    cancelSuccess: null,
    
    takeTurn: {
      professionSelected: "",
      profesionalSelected: "",
      doctorId: "",
      dateSelected: null,
      timeSelected: null,
      scheduledAt: null,
      reason: "",
    },
    showTurns: {
      dateSelected: null,
      statusFilter: "",
    },
    
    accessToken: null,
    userId: null,
  } as TurnMachineContext,
  types: {
    context: {} as TurnMachineContext,
    events: {} as TurnMachineEvent,
  },
  states: {
    takeTurn: {
      initial: "step1",
      states: {
        step1: {
          on: {
            UPDATE_FORM_TAKE_TURN: {
              actions: assign({
                takeTurn: ({ context, event }) => ({
                  ...context.takeTurn,
                  [event.key]: event.value,
                }),
              }),
            },
            NEXT: "step2",
            RESET_TAKE_TURN: {
              target: "step1",
              actions: assign({
                takeTurn: {
                  professionSelected: "",
                  profesionalSelected: "",
                  doctorId: "",
                  dateSelected: null,
                  timeSelected: null,
                  scheduledAt: null,
                  reason: "",
                },
              }),
            },
          },
        },
        step2: {
          entry: ({ context }) => {
            // Load available turns for the next 30 days when entering step2
            if (context.takeTurn.doctorId) {
              const today = new Date();
              for (let i = 0; i < 30; i++) {
                const checkDate = new Date(today);
                checkDate.setDate(today.getDate() + i);
                const dateString = checkDate.toISOString().split('T')[0];
                
                orchestrator.send({
                  type: "LOAD_AVAILABLE_TURNS",
                  doctorId: context.takeTurn.doctorId,
                  date: dateString
                });
              }
            }
          },
          on: {
            UPDATE_FORM_TAKE_TURN: {
              actions: [
                assign({
                  takeTurn: ({ context, event }) => ({
                    ...context.takeTurn,
                    [event.key]: event.value,
                  }),
                }),
                // Load available turns when date is selected
                ({ context, event }) => {
                  if (event.key === 'dateSelected' && event.value && context.takeTurn.doctorId) {
                    const selectedDate = event.value.format('YYYY-MM-DD');
                    orchestrator.send({
                      type: "LOAD_AVAILABLE_TURNS",
                      doctorId: context.takeTurn.doctorId,
                      date: selectedDate
                    });
                  }
                }
              ],
            },
            BACK: "step1",
            RESET_TAKE_TURN: {
              target: "step1",
              actions: assign({
                takeTurn: {
                  professionSelected: "",
                  profesionalSelected: "",
                  doctorId: "",
                  dateSelected: null,
                  timeSelected: null,
                  scheduledAt: null,
                  reason: "",
                },
              }),
            },
          },
        },
      },
    },
    showTurns: {
      initial: "idle",
      states: {
        idle: {
          on: {
            UPDATE_FORM_SHOW_TURNS: {
              actions: assign({
                showTurns: ({ context, event }) => ({
                  ...context.showTurns,
                  [event.key]: event.value,
                }),
              }),
            },
            RESET_SHOW_TURNS: {
              target: "idle",
              actions: assign({
                showTurns: { 
                  dateSelected: null,
                  statusFilter: "",
                },
              }),
            },
          },
        },
      },
    },
    dataManagement: {
      initial: "idle",
      states: {
        idle: {
          on: {
            DATA_LOADED: {
              actions: assign(() => {
                try {
                  const dataSnapshot = orchestrator.getSnapshot(DATA_MACHINE_ID);
                  const dataContext = dataSnapshot.context;
                  return {
                    doctors: dataContext.doctors || [],
                    availableTurns: dataContext.availableTurns || [],
                    myTurns: dataContext.myTurns || [],
                  };
                } catch (error) {
                  console.warn("Could not get dataMachine snapshot:", error);
                  return {};
                }
              }),
            },
            RESERVE_TURN: {
              target: "reservingTurn",
            },
            CREATE_TURN: {
              target: "creatingTurn",
            },
          },
        },
        reservingTurn: {
          entry: assign({
            isReservingTurn: true,
            reserveError: null,
          }),
          invoke: {
            src: fromPromise(async ({ input }: { input: { accessToken: string; userId: string; turnId: string } }) => {
              return await reserveTurn(input);
            }),
            input: ({ context, event }) => ({
              accessToken: context.accessToken!,
              userId: context.userId!,
              turnId: (event as any).turnId
            }),
            onDone: {
              target: "idle",
              actions: assign({
                isReservingTurn: false,
                reserveError: null,
              }),
            },
            onError: {
              target: "idle",
              actions: assign({
                isReservingTurn: false,
                reserveError: ({ event }) => (event.error as Error)?.message || "Error reserving turn",
              }),
            },
          },
        },
        creatingTurn: {
          entry: assign({
            isCreatingTurn: true,
            error: null,
          }),
          invoke: {
            src: fromPromise(async ({ input }: { input: { accessToken: string; userId: string; doctorId: string; scheduledAt: string } }) => {
              return await createTurn(input);
            }),
            input: ({ context }) => {
              const inputData = {
                accessToken: context.accessToken!,
                userId: context.userId!,
                doctorId: context.takeTurn.doctorId,
                scheduledAt: context.takeTurn.scheduledAt!
              };
              return inputData;
            },
            onDone: {
              target: "idle",
              actions: assign({
                isCreatingTurn: false,
                error: null,
              }),
            },
            onError: {
              target: "idle",
              actions: assign({
                isCreatingTurn: false,
                error: ({ event }) => (event.error as Error)?.message || "Error creating turn",
              }),
            },
          },
        },
        cancellingTurn: {
          entry: assign({
            isCancellingTurn: true,
          }),
          invoke: {
            src: fromPromise(async ({ input }: { input: { accessToken: string; turnId: string } }) => {
              return await cancelTurn(input);
            }),
            input: ({ context }) => ({
              accessToken: context.accessToken!,
              turnId: context.cancellingTurnId!
            }),
            onDone: {
              target: "idle",
              actions: assign({
                isCancellingTurn: false,
                cancellingTurnId: null,
                cancelSuccess: "Turno cancelado exitosamente",
              }),
            },
            onError: {
              target: "idle",
              actions: assign({
                isCancellingTurn: false,
                cancellingTurnId: null,
                error: ({ event }) => (event.error as Error)?.message || "Error al cancelar el turno",
              }),
            },
          },
        },
      },
    },
  },
  
  on: {
    CANCEL_TURN: {
      target: ".dataManagement.cancellingTurn",
      actions: assign({
        cancellingTurnId: ({ event }) => event.turnId,
      }),
    },
    CLEAR_CANCEL_SUCCESS: {
      actions: assign({
        cancelSuccess: null,
      }),
    },
  },
});