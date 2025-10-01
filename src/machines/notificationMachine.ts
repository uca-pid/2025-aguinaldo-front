import { createMachine, assign, fromPromise } from "xstate";
import { orchestrator } from "#/core/Orchestrator";
import { NotificationService, NotificationResponse } from '../service/notification-service.service';
import { UI_MACHINE_ID } from "./uiMachine";

export const NOTIFICATION_MACHINE_ID = "notification";
export const NOTIFICATION_MACHINE_EVENT_TYPES = [
  "LOAD_NOTIFICATIONS",
  "DELETE_NOTIFICATION",
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
          const notification = context.notifications[context.currentNotificationIndex];
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
          actions: [
            assign(({ context }) => {
              const remainingNotifications = context.notifications.filter(
                (_, index) => index !== context.currentNotificationIndex
              );
              return {
                notifications: remainingNotifications,
                currentNotificationIndex: 0,
              };
            }),
            ({ context }) => {
              // Check if there are more notifications after removal
              const remainingNotifications = context.notifications.filter(
                (_, index) => index !== context.currentNotificationIndex
              );
              
              if (remainingNotifications.length === 0) {
                orchestrator.sendToMachine(NOTIFICATION_MACHINE_ID, {
                  type: "ALL_NOTIFICATIONS_SHOWN"
                });
              }
            },
          ],
        },
        onError: {
          target: "showingNotifications",
          actions: assign(({ context }) => {
            // Remove the notification even if delete failed (optimistic update)
            const remainingNotifications = context.notifications.filter(
              (_, index) => index !== context.currentNotificationIndex
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