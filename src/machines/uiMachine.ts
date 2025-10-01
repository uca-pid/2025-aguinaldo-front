import { createMachine, assign } from "xstate";
import { orchestrator } from "#/core/Orchestrator";

export const UI_MACHINE_ID = "ui";
export const UI_MACHINE_EVENT_TYPES = ["TOGGLE", "NAVIGATE", "OPEN_SNACKBAR", "CLOSE_SNACKBAR", "OPEN_CONFIRMATION_DIALOG", "OPEN_CANCEL_TURN_DIALOG", "CLOSE_CONFIRMATION_DIALOG"];

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
    action: 'approve' | 'reject' | 'cancel_turn' | null;
    requestId: string | null;
    turnId: string | null;
    turnData?: any;
  };
}

export type UiMachineEvent =
  | { type: "ADD_NAVIGATE_HOOK"; navigate: (to: string) => void; initialPath: string }
  | { type: "TOGGLE"; key: string }
  | { type: "NAVIGATE"; to: string | null }
  | { type: "OPEN_SNACKBAR"; message: string; severity: 'success' | 'error' | 'warning' | 'info' }
  | { type: "CLOSE_SNACKBAR" }
  | { type: "OPEN_CONFIRMATION_DIALOG"; action: 'approve' | 'reject'; requestId: string }
  | { type: "OPEN_CANCEL_TURN_DIALOG"; turnId: string; turnData?: any }
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
    confirmDialog: { open: false, action: null, requestId: null, turnId: null, turnData: null },
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
          actions: [assign({
            snackbar: ({ event }) => ({
              open: true,
              message: event.message,
              severity: event.severity,
            }),
          }),
          () => {
            setTimeout(() => {
              orchestrator.send({ type: "CLOSE_SNACKBAR" });
            }, 6000);
          }
        ],
        },
        CLOSE_SNACKBAR: {
          actions: [
            assign({
              snackbar: ({ context }) => ({
                ...context.snackbar,
                open: false,
              }),
            }),
            () => {
              orchestrator.send({ type: 'NOTIFICATION_CLOSED' });
            }
          ],
        },
        OPEN_CONFIRMATION_DIALOG: {
          actions: assign({
            confirmDialog: ({ event }) => ({
              open: true,
              action: event.action,
              requestId: event.requestId,
              turnId: null,
              turnData: null,
            }),
          }),
        },
        OPEN_CANCEL_TURN_DIALOG: {
          actions: assign({
            confirmDialog: ({ event }) => ({
              open: true,
              action: 'cancel_turn' as const,
              requestId: null,
              turnId: event.turnId,
              turnData: event.turnData,
            }),
          }),
        },
        CLOSE_CONFIRMATION_DIALOG: {
          actions: assign({
            confirmDialog: () => ({
              open: false,
              action: null,
              requestId: null,
              turnId: null,
              turnData: null,
            }),
          }),
        },
      },
    },
  },
});
