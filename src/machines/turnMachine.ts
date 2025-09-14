import { createMachine, assign } from "xstate";
import { Dayjs } from "dayjs";
export interface TurnMachineContext {
  takeTurn: {
    professionSelected: string;
    profesionalSelected: string;
    dateSelected: Dayjs | null;
    timeSelected: Dayjs | null;
    reason: string;
  };
  showTurns: {
    dateSelected: Dayjs | null;
  };
}

export type TurnMachineEvent =
  | { type: "UPDATE_FORM_TAKE_TURN"; key: string; value: any }
  | { type: "UPDATE_FORM_SHOW_TURNS"; key: string; value: any }
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "RESET_TAKE_TURN" }
  | { type: "RESET_SHOW_TURNS" };

export const turnMachine = createMachine({
  id: "turnMachine",
  type: "parallel", 
  context: {
    takeTurn: {
      professionSelected: "",
      profesionalSelected: "",
      dateSelected: null,
      timeSelected: null,
      reason: "",
    },
    showTurns: {
      dateSelected: null,
    },
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
                  dateSelected: null,
                  timeSelected: null,
                  reason: "",
                },
              }),
            },
          },
        },
        step2: {
          on: {
            UPDATE_FORM_TAKE_TURN: {
              actions: assign({
                takeTurn: ({ context, event }) => ({
                  ...context.takeTurn,
                  [event.key]: event.value,
                }),
              }),
            },
            BACK: "step1",
            RESET_TAKE_TURN: {
              target: "step1",
              actions: assign({
                takeTurn: {
                  professionSelected: "",
                  profesionalSelected: "",
                  dateSelected: null,
                  timeSelected: null,
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
                showTurns: { dateSelected: null },
              }),
            },
          },
        },
      },
    },
  },
});