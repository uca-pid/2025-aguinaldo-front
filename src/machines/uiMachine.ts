import { createMachine, assign } from "xstate";

export const UI_MACHINE_ID = "ui";
export const UI_MACHINE_EVENT_TYPES = ["TOGGLE", "NAVIGATE", "OPEN_SNACKBAR", "CLOSE_SNACKBAR"];

export interface UiMachineContext {
  toggleStates: Record<string, boolean>;
  currentPath: string;
  navigate: (to: string) => void;
  snackbar: {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  };
}

export type UiMachineEvent =
  | { type: "ADD_NAVIGATE_HOOK"; navigate: (to: string) => void; initialPath: string }
  | { type: "TOGGLE"; key: string }
  | { type: "NAVIGATE"; to: string | null }
  | { type: "OPEN_SNACKBAR"; message: string; severity: 'success' | 'error' | 'warning' | 'info' }
  | { type: "CLOSE_SNACKBAR" };

export const uiMachine = createMachine({
  id: "ui",
  initial: "idle",
  context: {
    toggleStates: {},
    currentPath: "/",
    navigate: (to: string) => { console.log(`Default navigate to: ${to}`); },
    snackbar: {
      open: false,
      message: "",
      severity: "info" as const,
    },
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
        OPEN_SNACKBAR: {
          actions: assign({
            snackbar: ({ event }) => ({
              open: true,
              message: event.message,
              severity: event.severity,
            }),
          }),
        },
        CLOSE_SNACKBAR: {
          actions: assign({
            snackbar: ({ context }) => ({
              ...context.snackbar,
              open: false,
            }),
          }),
        },
      },
    },
  },
});
