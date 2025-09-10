import { createMachine, assign } from "xstate";

export interface UiMachineContext {
  toggleStates?: Record<string, boolean>;
}

export type UiMachineEvent =
  | { type: "TOGGLE"; key: string }

export const uiMachine = createMachine({
  id: "register",
  initial: "idle",
  context: {  },
  types: {
    context: {} as UiMachineContext,
    events: {} as UiMachineEvent,
  },
  states: {
    idle: {
      on: {
        TOGGLE: {
          actions: assign({
            toggleStates: ({context, event}) => ({
              ...context.toggleStates,
              [event.key]: !context.toggleStates?.[event.key],
            }),
          }),
        },
      },
    },
  },
} as const);
