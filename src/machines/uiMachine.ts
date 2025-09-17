import { createMachine, assign } from "xstate";

export interface UiMachineContext {
  toggleStates?: Record<string, boolean>;
  currentPath?: string;
  navigationRequested?: string | null;
  navigate: (to: string) => void;
}

export type UiMachineEvent =
  | { type: "TOGGLE"; key: string }
  | { type: "NAVIGATE"; to: string | null };

export const uiMachine = createMachine({
  id: "ui",
  initial: "idle",
  context: ({input}) => ({
    toggleStates: {},
    currentPath: "/",
    navigationRequested: null,
    navigate: input.navigate,
  }), 
  types: { 
    context: {} as UiMachineContext,
    events: {} as UiMachineEvent,
    input: {} as { navigate: (to: string) => void },
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
          actions: ({ context, event }) => {
            if (event.to) {
              context.navigate(event.to);
            }
          },
        },
      },
    },
  },
});
