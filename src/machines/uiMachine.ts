import { createMachine, assign } from "xstate";

export interface UiMachineContext {
  toggleStates?: Record<string, boolean>;
  currentPath?: string;
  navigationRequested?: string | null;
}

export type UiMachineEvent =
  | { type: "TOGGLE"; key: string }
  | { type: "NAVIGATE"; to: string | null };

export const uiMachine = createMachine({
  id: "ui",
  initial: "idle",
  context: {
    toggleStates: {},
    currentPath: "/",
    navigationRequested: null,
  }, 
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
        NAVIGATE: {
          actions: assign({
            navigationRequested: ({ event }) => event.to,
          }),
        },
      },
    },
  },
});
