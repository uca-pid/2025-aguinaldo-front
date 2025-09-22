import { createMachine, assign, fromPromise } from "xstate";
import { AdminService } from "#/service/admin-service.service";
import type { PendingDoctor, DoctorApprovalResponse } from "#/models/Admin";

export const ADMIN_USER_MACHINE_ID = "adminUser";
export const ADMIN_USER_MACHINE_EVENT_TYPES = [
  'FETCH_PENDING_DOCTORS',
  'FETCH_ADMIN_STATS',
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
    type: 'approve' | 'reject' | 'fetch' | null;
    doctorId?: string;
    success?: boolean;
    message?: string;
  } | null;
  selectedDoctor?: PendingDoctor | null;
}

export const AdminUserMachineDefaultContext: AdminUserMachineContext = {
  loading: false,
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
  | { type: "FETCH_PENDING_DOCTORS"; accessToken: string }
  | { type: "FETCH_ADMIN_STATS"; accessToken: string }
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
        FETCH_PENDING_DOCTORS: {
          target: "fetchingPendingDoctors"
        },
        FETCH_ADMIN_STATS: {
          target: "fetchingAdminStats"
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

    fetchingPendingDoctors: {
      entry: assign(() => ({
        loading: true,
        error: null
      })),
      invoke: {
        src: fromPromise(async ({ input }: { input: { accessToken: string } }) => {
          return await AdminService.getPendingDoctors(input.accessToken);
        }),
        input: ({ event }) => ({
          accessToken: (event as any).accessToken
        }),
        onDone: {
          target: "idle",
          actions: assign(({ event, context }) => ({
            loading: false,
            pendingDoctors: event.output,
            adminStats: {
              ...context.adminStats,
              pending: event.output.length
            },
            lastOperation: {
              type: 'fetch' as const,
              success: true,
              message: `Found ${event.output.length} pending doctors`
            }
          }))
        },
        onError: {
          target: "idle",
          actions: assign(({ event }) => ({
            loading: false,
            error: event.error instanceof Error ? event.error.message : 'Failed to fetch pending doctors',
            lastOperation: {
              type: 'fetch' as const,
              success: false,
              message: 'Failed to fetch pending doctors'
            }
          }))
        }
      }
    },

    fetchingAdminStats: {
      entry: assign(() => ({
        loading: true,
        error: null
      })),
      invoke: {
        src: fromPromise(async ({ input }: { input: { accessToken: string } }) => {
          return await AdminService.getAdminStats(input.accessToken);
        }),
        input: ({ event }) => ({
          accessToken: (event as any).accessToken
        }),
        onDone: {
          target: "idle",
          actions: assign(({ event }) => ({
            loading: false,
            adminStats: event.output,
            lastOperation: {
              type: 'fetch' as const,
              success: true,
              message: 'Statistics updated successfully'
            }
          }))
        },
        onError: {
          target: "idle",
          actions: assign(({ event }) => ({
            loading: false,
            error: event.error instanceof Error ? event.error.message : 'Failed to fetch admin statistics',
            lastOperation: {
              type: 'fetch' as const,
              success: false,
              message: 'Failed to fetch admin statistics'
            }
          }))
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
          return await AdminService.approveDoctor(input.doctorId, input.accessToken);
        }),
        input: ({ event }) => ({
          doctorId: (event as any).doctorId,
          accessToken: (event as any).accessToken
        }),
        onDone: {
          target: "idle",
          actions: assign(({ event, context }) => {
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
          })
        },
        onError: {
          target: "idle",
          actions: assign(({ event }) => ({
            loading: false,
            error: event.error instanceof Error ? event.error.message : 'Failed to approve doctor',
            lastOperation: {
              type: 'approve' as const,
              success: false,
              message: 'Failed to approve doctor'
            }
          }))
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
          return await AdminService.rejectDoctor(input.doctorId, input.accessToken);
        }),
        input: ({ event }) => ({
          doctorId: (event as any).doctorId,
          accessToken: (event as any).accessToken
        }),
        onDone: {
          target: "idle",
          actions: assign(({ event, context }) => {
            const rejectionResponse = event.output as DoctorApprovalResponse;
            // Remove the rejected doctor from pending list
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
          })
        },
        onError: {
          target: "idle",
          actions: assign(({ event }) => ({
            loading: false,
            error: event.error instanceof Error ? event.error.message : 'Failed to reject doctor',
            lastOperation: {
              type: 'reject' as const,
              success: false,
              message: 'Failed to reject doctor'
            }
          }))
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
          target: "fetchingPendingDoctors",
          guard: ({ context }) => context.lastOperation?.type === 'fetch'
        },
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
