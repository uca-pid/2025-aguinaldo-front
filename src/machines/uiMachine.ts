import { createMachine, assign } from "xstate";

export const UI_MACHINE_ID = "ui";
export const UI_MACHINE_EVENT_TYPES = ["TOGGLE", "NAVIGATE", "OPEN_SNACKBAR", "CLOSE_SNACKBAR", "OPEN_CONFIRMATION_DIALOG", "CLOSE_CONFIRMATION_DIALOG"];

export interface UiMachineContext {
  toggleStates: Record<string, boolean>;
  currentPath: string;
  navigate: (to: string) => void;
  snackbar: {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  };
  confirmDialog: {
    open: boolean;
    action: 'approve' | 'reject' | null;
    requestId: string | null;
  };
}

export type UiMachineEvent =
  | { type: "ADD_NAVIGATE_HOOK"; navigate: (to: string) => void; initialPath: string }
  | { type: "TOGGLE"; key: string }
  | { type: "NAVIGATE"; to: string | null }
  | { type: "OPEN_SNACKBAR"; message: string; severity: 'success' | 'error' | 'warning' | 'info' }
  | { type: "CLOSE_SNACKBAR" }
  | { type: "OPEN_CONFIRMATION_DIALOG"; action: 'approve' | 'reject'; requestId: string }
  | { type: "CLOSE_CONFIRMATION_DIALOG" };

export const uiMachine = createMachine({
  id: "ui",
  initial: "idle",
  context: {
    toggleStates: {
      loadingApprove: false,
      loadingReject: false,
    },
    currentPath: "/",
    navigate: (to: string) => { console.log(`Default navigate to: ${to}`); },
    snackbar: {
      open: false,
      message: "",
      severity: "info" as const,
    },
    confirmDialog: { open: false, action: null, requestId: null },
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
        OPEN_CONFIRMATION_DIALOG: {
          actions: assign({
            confirmDialog: ({ event }) => ({
              open: true,
              action: event.action,
              requestId: event.requestId,
            }),
          }),
        },
        CLOSE_CONFIRMATION_DIALOG: {
          actions: assign({
            confirmDialog: () => ({
              open: false,
              action: null,
              requestId: null,
            }),
          }),
        },
      },
    },
  },
});
