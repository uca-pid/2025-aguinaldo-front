import { createMachine, assign, fromPromise } from "xstate";
import { approveDoctor, rejectDoctor } from "../utils/MachineUtils/adminUserMachineUtils";
import { orchestrator } from "#/core/Orchestrator";
import type { PendingDoctor, DoctorApprovalResponse } from "#/models/Admin";
import { DATA_MACHINE_ID } from "./dataMachine";
import { UI_MACHINE_ID } from "./uiMachine";

export const ADMIN_USER_MACHINE_ID = "adminUser";
export const ADMIN_USER_MACHINE_EVENT_TYPES = [
  'DATA_LOADED',
  'LOADING',
  'APPROVE_DOCTOR', 
  'REJECT_DOCTOR',
  'SELECT_DOCTOR',
  'CLEAR_SELECTION',
  'CLEAR_ERROR',
  'RETRY_LAST_OPERATION'
];

export interface AdminUserMachineContext {
  loading: boolean;
  error: string | null;
  pendingDoctors: PendingDoctor[];
  adminStats: {
    patients: number;
    doctors: number;
    pending: number;
  };
  lastOperation: {
    type: 'approve' | 'reject' | null;
    doctorId?: string;
    success?: boolean;
    message?: string;
  } | null;
  selectedDoctor?: PendingDoctor | null;
}

export const AdminUserMachineDefaultContext: AdminUserMachineContext = {
  loading: true,
  error: null,
  pendingDoctors: [],
  adminStats: {
    patients: 0,
    doctors: 0,
    pending: 0,
  },
  lastOperation: null,
  selectedDoctor: null,
};

export type AdminUserMachineEvent =
  | { type: "DATA_LOADED" }
  | { type: "LOADING" }
  | { type: "APPROVE_DOCTOR"; doctorId: string; accessToken: string }
  | { type: "REJECT_DOCTOR"; doctorId: string; accessToken: string }
  | { type: "SELECT_DOCTOR"; doctor: PendingDoctor }
  | { type: "CLEAR_SELECTION" }
  | { type: "CLEAR_ERROR" }
  | { type: "RETRY_LAST_OPERATION"; accessToken: string };

export const adminUserMachine = createMachine({
  id: "adminUser",
  initial: "idle",
  context: AdminUserMachineDefaultContext,
  types: {
    context: {} as AdminUserMachineContext,
    events: {} as AdminUserMachineEvent,
  },
  states: {
    idle: {
      on: {
        DATA_LOADED: {
          actions: assign(() => {
            try {
              const dataSnapshot = orchestrator.getSnapshot(DATA_MACHINE_ID);
              const dataContext = dataSnapshot.context;
              return {
                pendingDoctors: dataContext.pendingDoctors || [],
                adminStats: dataContext.adminStats || { patients: 0, doctors: 0, pending: 0 },
                loading: false
              };
            } catch (error) {
              console.warn("Could not get dataMachine snapshot:", error);
              return {};
            }
          })
        },
        LOADING: {
          actions: assign(() => ({ loading: true, error: null }))
        },
        APPROVE_DOCTOR: {
          target: "approvingDoctor"
        },
        REJECT_DOCTOR: {
          target: "rejectingDoctor"
        },
        SELECT_DOCTOR: {
          actions: assign(({ event }) => ({
            selectedDoctor: event.doctor
          }))
        },
        CLEAR_SELECTION: {
          actions: assign(() => ({
            selectedDoctor: null
          }))
        },
        CLEAR_ERROR: {
          actions: assign(() => ({
            error: null,
            lastOperation: null
          }))
        },
        RETRY_LAST_OPERATION: {
          target: "retryingOperation"
        }
      }
    },

    approvingDoctor: {
      entry: assign(() => ({
        loading: true,
        error: null
      })),
      invoke: {
        src: fromPromise(async ({ input }: { input: { doctorId: string; accessToken: string } }) => {
          return await approveDoctor(input);
        }),
        input: ({ event }) => ({
          doctorId: (event as any).doctorId,
          accessToken: (event as any).accessToken
        }),
        onDone: {
          target: "idle",
          actions: [
            assign(({ event, context }) => {
              const approvalResponse = event.output as DoctorApprovalResponse;
              const updatedPendingDoctors = context.pendingDoctors.filter(
                doctor => doctor.id !== approvalResponse.doctorId
              );
              return {
                loading: false,
                pendingDoctors: updatedPendingDoctors,
                adminStats: {
                  ...context.adminStats,
                  pending: updatedPendingDoctors.length,
                  doctors: context.adminStats.doctors + 1
                },
                lastOperation: {
                  type: 'approve' as const,
                  doctorId: approvalResponse.doctorId,
                  success: true,
                  message: approvalResponse.message
                },
                selectedDoctor: null
              };
            }),
            ({ event }) => {
              const approvalResponse = event.output as DoctorApprovalResponse;
              orchestrator.sendToMachine(UI_MACHINE_ID, {
                type: "OPEN_SNACKBAR",
                message: `Doctor aprobado exitosamente: ${approvalResponse.message}`,
                severity: "success"
              });
            }
          ],
        },
        onError: {
          target: "idle",
          actions: [
            assign(({ event }) => ({
              loading: false,
              error: event.error instanceof Error ? event.error.message : 'Failed to approve doctor',
              lastOperation: {
                type: 'approve' as const,
                success: false,
                message: 'Failed to approve doctor'
              }
            })),
            ({ event }) => {
              const errorMessage = event.error instanceof Error ? event.error.message : 'Error al aprobar doctor';
              orchestrator.sendToMachine(UI_MACHINE_ID, {
                type: "OPEN_SNACKBAR",
                message: errorMessage,
                severity: "error"
              });
            }
          ],
        }
      }
    },

    rejectingDoctor: {
      entry: assign(() => ({
        loading: true,
        error: null
      })),
      invoke: {
        src: fromPromise(async ({ input }: { input: { doctorId: string; accessToken: string } }) => {
          return await rejectDoctor(input);
        }),
        input: ({ event }) => ({
          doctorId: (event as any).doctorId,
          accessToken: (event as any).accessToken
        }),
        onDone: {
          target: "idle",
          actions: [
            assign(({ event, context }) => {
              const rejectionResponse = event.output as DoctorApprovalResponse;
              const updatedPendingDoctors = context.pendingDoctors.filter(
                doctor => doctor.id !== rejectionResponse.doctorId
              );
              return {
                loading: false,
                pendingDoctors: updatedPendingDoctors,
                adminStats: {
                  ...context.adminStats,
                  pending: updatedPendingDoctors.length
                },
                lastOperation: {
                  type: 'reject' as const,
                  doctorId: rejectionResponse.doctorId,
                  success: true,
                  message: rejectionResponse.message
                },
                selectedDoctor: null
              };
            }),
            ({ event }) => {
              const rejectionResponse = event.output as DoctorApprovalResponse;
              orchestrator.sendToMachine(UI_MACHINE_ID, {
                type: "OPEN_SNACKBAR",
                message: `Doctor rechazado exitosamente: ${rejectionResponse.message}`,
                severity: "success"
              });
            }
          ],
        },
        onError: {
          target: "idle",
          actions: [
            assign(({ event }) => ({
              loading: false,
              error: event.error instanceof Error ? event.error.message : 'Failed to reject doctor',
              lastOperation: {
                type: 'reject' as const,
                success: false,
                message: 'Failed to reject doctor'
              }
            })),
            ({ event }) => {
              const errorMessage = event.error instanceof Error ? event.error.message : 'Error al rechazar doctor';
              orchestrator.sendToMachine(UI_MACHINE_ID, {
                type: "OPEN_SNACKBAR",
                message: errorMessage,
                severity: "error"
              });
            }
          ],
        }
      }
    },

    retryingOperation: {
      entry: assign(() => ({
        loading: true,
        error: null
      })),
      always: [
        {
          target: "approvingDoctor",
          guard: ({ context }) => context.lastOperation?.type === 'approve' && !!context.lastOperation?.doctorId
        },
        {
          target: "rejectingDoctor",
          guard: ({ context }) => context.lastOperation?.type === 'reject' && !!context.lastOperation?.doctorId
        },
        {
          target: "idle"
        }
      ]
    }
  }
});
