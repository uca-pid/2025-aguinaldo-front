import { createMachine, assign, fromPromise } from "xstate";
import { NotificationService, NotificationResponse } from '../service/notification-service.service';

export const NOTIFICATION_MACHINE_ID = "notification";
export const NOTIFICATION_MACHINE_EVENT_TYPES = [
  "SET_AUTH",
  "LOAD_NOTIFICATIONS",
  "DELETE_NOTIFICATION",
  "DELETE_ALL_NOTIFICATIONS",
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
  | { type: "SET_AUTH"; accessToken: string }
  | { type: "LOAD_NOTIFICATIONS"; accessToken?: string }
  | { type: "DELETE_NOTIFICATION"; notificationId: string }
  | { type: "DELETE_ALL_NOTIFICATIONS" }
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
        SET_AUTH: {
          actions: assign({
            accessToken: ({ event }) => event.accessToken,
          }),
        },
        LOAD_NOTIFICATIONS: {
          target: "loadingNotifications",
          actions: assign({
            accessToken: ({ event, context }) => event.accessToken || context.accessToken,
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
        LOAD_NOTIFICATIONS: {
          target: "loadingNotifications",
          actions: assign({
            accessToken: ({ event, context }) => event.accessToken || context.accessToken,
          }),
        },
        DELETE_NOTIFICATION: "deletingNotification",
        DELETE_ALL_NOTIFICATIONS: "deletingAllNotifications",
      },
    },
    deletingNotification: {
      invoke: {
        src: fromPromise(async ({ input }) => {
          await NotificationService.deleteNotification(input.notificationId, input.accessToken);
          return input.notificationId; // Return the ID so we can use it in onDone
        }),
        input: ({ context, event }) => ({
          notificationId: (event as any).notificationId,
          accessToken: context.accessToken,
        }),
        onDone: {
          target: "loadingNotifications",
        },
        onError: {
          target: "loadingNotifications",
          actions: assign({
            error: ({ event }) => (event.error as Error)?.message || "Failed to delete notification",
          }),
        },
      },
    },
    deletingAllNotifications: {
      invoke: {
        src: fromPromise(async ({ input }) => {
          // Delete all notifications sequentially
          const promises = input.notificationIds.map((id: string) => 
            NotificationService.deleteNotification(id, input.accessToken)
          );
          await Promise.all(promises);
        }),
        input: ({ context }) => ({
          notificationIds: context.notifications.map(n => n.id),
          accessToken: context.accessToken,
        }),
        onDone: {
          target: "loadingNotifications",
        },
        onError: {
          target: "loadingNotifications",
          actions: assign({
            error: ({ event }) => (event.error as Error)?.message || "Failed to delete notifications",
          }),
        },
      },
    },
  },
  on: {
    SET_AUTH: {
      actions: assign({
        accessToken: ({ event }) => event.accessToken,
      }),
    },
    ALL_NOTIFICATIONS_SHOWN: {
      actions: assign({
        notifications: [],
        currentNotificationIndex: 0,
      }),
    },
  },
});