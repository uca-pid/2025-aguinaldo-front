import { createMachine, assign } from "xstate";

export const UI_MACHINE_ID = "ui";
export const UI_MACHINE_EVENT_TYPES = ["TOGGLE", "NAVIGATE"];

export interface UiMachineContext {
  toggleStates: Record<string, boolean>;
  currentPath: string;
  navigate: (to: string) => void;
}

export type UiMachineEvent =
  | { type: "ADD_NAVIGATE_HOOK"; navigate: (to: string) => void; initialPath: string }
  | { type: "TOGGLE"; key: string }
  | { type: "NAVIGATE"; to: string | null };

export const uiMachine = createMachine({
  id: "ui",
  initial: "idle",
  context: {
    toggleStates: {},
    currentPath: "/",
    navigate: (to: string) => { console.log(`Default navigate to: ${to}`); },
  },
  types: { 
    context: {} as UiMachineContext,
    events: {} as UiMachineEvent,
    input: {} as { navigate: (to: string) => void },
  },
  states: { 
    idle: {
      on: { 
        ADD_NAVIGATE_HOOK: {
          actions: assign({
            navigate: ({ event }: any) => event.navigate,
            currentPath: ({ event }: any) => event.initialPath || '/',
          }),
        },
        TOGGLE: {
          actions: assign({
            toggleStates: ({ context, event }) => ({
              ...context.toggleStates,
              [event.key]: !context.toggleStates?.[event.key],
            }), 
          }),
        },
        NAVIGATE: {
          actions: ({ context, event }) => {
            if (event.to) {
              context.navigate(event.to);
              context.currentPath = event.to;
            }
          },
        },
      },
    },
  },
});
