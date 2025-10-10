import { createMachine, assign, fromPromise } from "xstate";
import { NotificationService, NotificationResponse } from '../service/notification-service.service';

export const NOTIFICATION_MACHINE_ID = "notification";
export const NOTIFICATION_MACHINE_EVENT_TYPES = [
  "LOAD_NOTIFICATIONS",
  "DELETE_NOTIFICATION",
  "ALL_NOTIFICATIONS_SHOWN",
];

export interface NotificationMachineContext {
  notifications: NotificationResponse[];
  currentNotificationIndex: number;
  isLoading: boolean;
  error: string | null;
  accessToken: string | null;
}

export type NotificationMachineEvent =
  | { type: "LOAD_NOTIFICATIONS"; accessToken: string }
  | { type: "DELETE_NOTIFICATION"; notificationId: string }
  | { type: "ALL_NOTIFICATIONS_SHOWN" };

export const notificationMachine = createMachine({
  id: "notificationMachine",
  initial: "idle",
  context: {
    notifications: [],
    currentNotificationIndex: 0,
    isLoading: false,
    error: null,
    accessToken: null,
  } as NotificationMachineContext,
  types: {
    context: {} as NotificationMachineContext,
    events: {} as NotificationMachineEvent,
  },
  states: {
    idle: {
      on: {
        LOAD_NOTIFICATIONS: {
          target: "loadingNotifications",
          actions: assign({
            accessToken: ({ event }) => event.accessToken,
          }),
        },
      },
    },
    loadingNotifications: {
      entry: assign({ isLoading: true, error: null }),
      invoke: {
        src: fromPromise(async ({ input }) => {
          return await NotificationService.getNotifications(input.accessToken);
        }),
        input: ({ context }) => ({
          accessToken: context.accessToken,
        }),
        onDone: {
          target: "ready",
          actions: assign({
            notifications: ({ event }) => event.output,
            currentNotificationIndex: 0,
            isLoading: false,
          }),
        },
        onError: {
          target: "idle",
          actions: assign({
            isLoading: false,
            error: ({ event }) => (event.error as Error)?.message || "Failed to load notifications",
          }),
        },
      },
    },
    ready: {
      on: {
        LOAD_NOTIFICATIONS: "loadingNotifications",
        DELETE_NOTIFICATION: "deletingNotification",
      },
    },
    deletingNotification: {
      invoke: {
        src: fromPromise(async ({ input }) => {
          await NotificationService.deleteNotification(input.notificationId, input.accessToken);
        }),
        input: ({ context, event }) => ({
          notificationId: (event as any).notificationId,
          accessToken: context.accessToken,
        }),
        onDone: {
          target: "ready",
          actions: assign(({ context, event }) => {
            const notificationIdToDelete = (event as any).input.notificationId;
            const remainingNotifications = context.notifications.filter(
              (notification) => notification.id !== notificationIdToDelete
            );
            return {
              notifications: remainingNotifications,
              currentNotificationIndex: 0,
            };
          }),
        },
        onError: {
          target: "ready",
          actions: assign(({ context, event }) => {
            // Remove the notification even if delete failed (optimistic update)
            const notificationIdToDelete = (event as any).input.notificationId;
            const remainingNotifications = context.notifications.filter(
              (notification) => notification.id !== notificationIdToDelete
            );
            return {
              notifications: remainingNotifications,
              currentNotificationIndex: 0,
            };
          }),
        },
      },
    },
  },
  on: {
    ALL_NOTIFICATIONS_SHOWN: {
      actions: assign({
        notifications: [],
        currentNotificationIndex: 0,
      }),
    },
  },
});