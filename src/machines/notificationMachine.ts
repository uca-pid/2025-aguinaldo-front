import { createMachine, assign, fromPromise } from "xstate";
import { orchestrator } from "#/core/Orchestrator";
import { NotificationService, NotificationResponse } from '../service/notification-service.service';
import { UI_MACHINE_ID } from "./uiMachine";

export const NOTIFICATION_MACHINE_ID = "notification";
export const NOTIFICATION_MACHINE_EVENT_TYPES = [
  "LOAD_NOTIFICATIONS",
  "DELETE_NOTIFICATION",
  "SHOW_NEXT_NOTIFICATION",
  "NOTIFICATION_CLOSED",
  "UPDATE_INDEX",
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
  | { type: "SHOW_NEXT_NOTIFICATION" }
  | { type: "NOTIFICATION_CLOSED" }
  | { type: "UPDATE_INDEX"; index: number }
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
          target: "showingNotifications",
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
    showingNotifications: {
      entry: ({ context }) => {
        if (context.notifications.length > 0) {
          const notification = context.notifications[0];
          const severity = notification.message.toLowerCase().includes('rechazada') || 
                          notification.message.toLowerCase().includes('cancelado') 
                          ? 'warning' : 'success';
          orchestrator.sendToMachine(UI_MACHINE_ID, {
            type: "OPEN_SNACKBAR",
            message: notification.message,
            severity: severity
          });
        }
      },
      on: {
        NOTIFICATION_CLOSED: {
          actions: ({ context }) => {
            const currentNotification = context.notifications[context.currentNotificationIndex];
            if (currentNotification) {
              orchestrator.sendToMachine(NOTIFICATION_MACHINE_ID, {
                type: "DELETE_NOTIFICATION",
                notificationId: currentNotification.id
              });
            }
          },
        },
        SHOW_NEXT_NOTIFICATION: {
          actions: ({ context }) => {
            const nextIndex = context.currentNotificationIndex + 1;
            if (nextIndex < context.notifications.length) {
              const nextNotification = context.notifications[nextIndex];
              const severity = nextNotification.message.toLowerCase().includes('rechazada') || 
                              nextNotification.message.toLowerCase().includes('cancelado') 
                              ? 'warning' : 'success';
              orchestrator.sendToMachine(UI_MACHINE_ID, {
                type: "OPEN_SNACKBAR",
                message: nextNotification.message,
                severity: severity
              });
            }
          },
        },
        LOAD_NOTIFICATIONS: "loadingNotifications",
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
          target: "showingNotifications",
          actions: ({ context }) => {
            const nextIndex = context.currentNotificationIndex + 1;
            if (nextIndex < context.notifications.length) {
              orchestrator.sendToMachine(NOTIFICATION_MACHINE_ID, {
                type: "SHOW_NEXT_NOTIFICATION"
              });
              orchestrator.sendToMachine(NOTIFICATION_MACHINE_ID, {
                type: "UPDATE_INDEX",
                index: nextIndex
              });
            } else {
              orchestrator.sendToMachine(NOTIFICATION_MACHINE_ID, {
                type: "ALL_NOTIFICATIONS_SHOWN"
              });
            }
          },
        },
        onError: {
          target: "showingNotifications",
          actions: ({ context }) => {
            const nextIndex = context.currentNotificationIndex + 1;
            if (nextIndex < context.notifications.length) {
              orchestrator.sendToMachine(NOTIFICATION_MACHINE_ID, {
                type: "SHOW_NEXT_NOTIFICATION"
              });
            }
          },
        },
      },
    },
  },
  on: {
    DELETE_NOTIFICATION: ".deletingNotification",
    UPDATE_INDEX: {
      actions: assign({
        currentNotificationIndex: ({ event }) => (event as any).index,
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