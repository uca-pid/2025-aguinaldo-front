import { createMachine, assign } from "xstate";
import { orchestrator } from "#/core/Orchestrator";

export const UI_MACHINE_ID = "ui";
export const UI_MACHINE_EVENT_TYPES = ["TOGGLE", "NAVIGATE", "OPEN_SNACKBAR", "CLOSE_SNACKBAR", "OPEN_CONFIRMATION_DIALOG", "OPEN_CANCEL_TURN_DIALOG", "CLOSE_CONFIRMATION_DIALOG", "OPEN_NOTIFICATION_MODAL", "CLOSE_NOTIFICATION_MODAL", "OPEN_RATING_MODAL", "CLOSE_RATING_MODAL"];

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
    action: 'approve' | 'reject' | 'cancel_turn' | 'delete_file' | null;
    requestId: string | null;
    turnId: string | null;
    turnData?: any;
    title?: string;
    message?: string;
    confirmButtonText?: string;
    confirmButtonColor?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  };
  notificationModal: {
    open: boolean;
  };
  ratingModal: {
    open: boolean;
    turn: any | null;
  };
}

export type UiMachineEvent =
  | { type: "ADD_NAVIGATE_HOOK"; navigate: (to: string) => void; initialPath: string }
  | { type: "TOGGLE"; key: string }
  | { type: "NAVIGATE"; to: string | null }
  | { type: "OPEN_SNACKBAR"; message: string; severity: 'success' | 'error' | 'warning' | 'info' }
  | { type: "CLOSE_SNACKBAR" }
  | { type: "OPEN_CONFIRMATION_DIALOG"; action: 'approve' | 'reject' | 'delete_file'; requestId?: string; turnId?: string; title?: string; message?: string; confirmButtonText?: string; confirmButtonColor?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' }
  | { type: "OPEN_CANCEL_TURN_DIALOG"; turnId: string; turnData?: any; title?: string; message?: string; confirmButtonText?: string; confirmButtonColor?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' }
  | { type: "CLOSE_CONFIRMATION_DIALOG" }
  | { type: "OPEN_NOTIFICATION_MODAL" }
  | { type: "CLOSE_NOTIFICATION_MODAL" }
  | { type: "OPEN_RATING_MODAL"; turn: any }
  | { type: "CLOSE_RATING_MODAL" };

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
    confirmDialog: { open: false, action: null, requestId: null, turnId: null, turnData: null, title: undefined, message: undefined, confirmButtonText: undefined, confirmButtonColor: undefined },
    notificationModal: { open: false },
    ratingModal: { open: false, turn: null },
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
          actions: [
            assign({
              navigate: ({ event }: any) => event.navigate,
              currentPath: ({ event }: any) => event.initialPath || '/',
            }),
            ({ event }: any) => {
              const initialPath = event.initialPath || '/';
              if (initialPath.startsWith('/patient-detail?patientId=')) {
                const patientId = initialPath.split('patientId=')[1];
                if (patientId) {
                  orchestrator.send({
                    type: "SELECT_PATIENT",
                    patientId: patientId
                  });
                }
              }
              try {
               
                if ((initialPath.startsWith('/patient/view-turns') || initialPath.startsWith('/doctor/view-turns')) && initialPath.includes('turnId=')) {
                  const query = initialPath.split('?')[1] || '';
                  const params = new URLSearchParams(query);
                  const turnId = params.get('turnId');
                  if (turnId) {
                    orchestrator.send({
                      type: 'OPEN_CANCEL_TURN_DIALOG',
                      turnId,
                      title: 'Cancelar Turno',
                      message: '¿Estás seguro de que quieres cancelar este turno? Esta acción no se puede deshacer.',
                      confirmButtonText: 'Cancelar Turno',
                      confirmButtonColor: 'error'
                    });
                  }
                }
              } catch (e) {
               
              }
            }
          ],
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
              const previousPath = context.currentPath;
              context.navigate(event.to);
              context.currentPath = event.to;

              if (event.to.startsWith('/patient-detail?patientId=') && previousPath !== event.to) {
                const patientId = event.to.split('patientId=')[1];
                
                if (patientId) {
                  orchestrator.send({
                    type: "SELECT_PATIENT",
                    patientId: patientId
                  });
                }
                else{
                  orchestrator.send({ type: "CLEAR_PATIENT_SELECTION" });
                }
              }
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
              requestId: event.requestId || null,
              turnId: event.turnId || null,
              turnData: null,
              title: event.title || 'Confirmar Acción',
              message: event.message || '',
              confirmButtonText: event.confirmButtonText || 'Confirmar',
              confirmButtonColor: event.confirmButtonColor || 'primary',
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
              title: event.title || 'Confirmar Acción',
              message: event.message || '¿Estás seguro de que quieres cancelar este turno? Esta acción no se puede deshacer.',
              confirmButtonText: event.confirmButtonText || 'Cancelar Turno',
              confirmButtonColor: event.confirmButtonColor || 'error',
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
              title: undefined,
              message: undefined,
              confirmButtonText: undefined,
              confirmButtonColor: undefined,
            }),
          }),
        },
        OPEN_NOTIFICATION_MODAL: {
          actions: assign({
            notificationModal: () => ({
              open: true,
            }),
          }),
        },
        CLOSE_NOTIFICATION_MODAL: {
          actions: assign({
            notificationModal: () => ({
              open: false,
            }),
          }),
        },
        OPEN_RATING_MODAL: {
          actions: [
            assign({
              ratingModal: ({ event }) => ({
                open: true,
                turn: event.turn,
              }),
            }),
            () => {
              const dataSnapshot = orchestrator.getSnapshot("data");
              if (dataSnapshot?.context?.ratingSubcategories?.length === 0) {
                orchestrator.sendToMachine("data", { 
                  type: "LOAD_RATING_SUBCATEGORIES", 
                  role: "PATIENT" 
                });
              }
            }
          ],
        },
        CLOSE_RATING_MODAL: {
          actions: assign({
            ratingModal: () => ({
              open: false,
              turn: null,
            }),
          }),
        },
      },
    },
  },
});
