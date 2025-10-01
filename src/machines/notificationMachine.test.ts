import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createActor } from 'xstate';

// Mock dependencies BEFORE importing the machine
vi.mock('#/core/Orchestrator', () => ({
  orchestrator: {
    sendToMachine: vi.fn(),
  }
}));

vi.mock('../service/notification-service.service', () => ({
  NotificationService: {
    getNotifications: vi.fn(),
    deleteNotification: vi.fn()
  }
}));

vi.mock('./uiMachine', () => ({
  UI_MACHINE_ID: 'uiMachine'
}));

import { notificationMachine, NOTIFICATION_MACHINE_ID } from './notificationMachine';
import { orchestrator } from '#/core/Orchestrator';
import { NotificationService } from '../service/notification-service.service';

describe('notificationMachine', () => {
  let actor: any;
  let mockOrchestrator: any;
  let mockNotificationService: any;

  beforeEach(() => {
    vi.useFakeTimers();
    // Get mocked modules
    mockOrchestrator = vi.mocked(orchestrator);
    mockNotificationService = vi.mocked(NotificationService);

    // Reset mocks
    vi.clearAllMocks();

    // Setup default mocks
    mockNotificationService.getNotifications.mockResolvedValue([]);
    mockNotificationService.deleteNotification.mockResolvedValue(undefined);
  });

  afterEach(() => {
    if (actor) {
      actor.stop();
    }
  });

  describe('initial state', () => {
    it('should start in idle state', () => {
      actor = createActor(notificationMachine);
      actor.start();

      expect(actor.getSnapshot().value).toBe('idle');
    });

    it('should initialize with default context', () => {
      actor = createActor(notificationMachine);
      actor.start();

      const context = actor.getSnapshot().context;
      expect(context.notifications).toEqual([]);
      expect(context.currentNotificationIndex).toBe(0);
      expect(context.isLoading).toBe(false);
      expect(context.error).toBe(null);
      expect(context.accessToken).toBe(null);
    });
  });

  describe('idle state', () => {
    beforeEach(() => {
      actor = createActor(notificationMachine);
      actor.start();
    });

    it('should handle LOAD_NOTIFICATIONS event', () => {
      actor.send({ type: 'LOAD_NOTIFICATIONS', accessToken: 'test-token' });

      expect(actor.getSnapshot().value).toBe('loadingNotifications');
      expect(actor.getSnapshot().context.accessToken).toBe('test-token');
      expect(actor.getSnapshot().context.isLoading).toBe(true);
      expect(actor.getSnapshot().context.error).toBe(null);
    });
  });

  describe('loadingNotifications state', () => {
    it('should set isLoading to true on entry', () => {
      actor = createActor(notificationMachine);
      actor.start();
      actor.send({ type: 'LOAD_NOTIFICATIONS', accessToken: 'token' });

      expect(actor.getSnapshot().context.isLoading).toBe(true);
      expect(actor.getSnapshot().context.error).toBe(null);
    });

    it('should successfully load notifications and transition to showingNotifications', async () => {
      const mockNotifications = [
        { id: '1', message: 'Turno confirmado para el 15/10', userId: 'user1' },
        { id: '2', message: 'Turno rechazada', userId: 'user1' }
      ];

      mockNotificationService.getNotifications.mockResolvedValue(mockNotifications);

      actor = createActor(notificationMachine);
      actor.start();
      actor.send({ type: 'LOAD_NOTIFICATIONS', accessToken: 'token' });

      await vi.waitFor(() => {
        expect(actor.getSnapshot().value).toBe('showingNotifications');
      });

      expect(mockNotificationService.getNotifications).toHaveBeenCalledWith('token');
      expect(actor.getSnapshot().context.notifications).toEqual(mockNotifications);
      expect(actor.getSnapshot().context.currentNotificationIndex).toBe(0);
      expect(actor.getSnapshot().context.isLoading).toBe(false);
    });

    it('should handle error and transition to idle', async () => {
      const mockError = new Error('Failed to fetch notifications');
      mockNotificationService.getNotifications.mockRejectedValue(mockError);

      actor = createActor(notificationMachine);
      actor.start();
      actor.send({ type: 'LOAD_NOTIFICATIONS', accessToken: 'token' });

      await vi.waitFor(() => {
        expect(actor.getSnapshot().value).toBe('idle');
      });

      expect(actor.getSnapshot().context.isLoading).toBe(false);
      expect(actor.getSnapshot().context.error).toBe('Failed to fetch notifications');
    });

    it('should handle generic error message', async () => {
      mockNotificationService.getNotifications.mockRejectedValue({});

      actor = createActor(notificationMachine);
      actor.start();
      actor.send({ type: 'LOAD_NOTIFICATIONS', accessToken: 'token' });

      await vi.waitFor(() => {
        expect(actor.getSnapshot().value).toBe('idle');
      });

      expect(actor.getSnapshot().context.error).toBe('Failed to load notifications');
    });
  });

  describe('showingNotifications state', () => {
    it('should show first notification on entry', async () => {
      const mockNotifications = [
        { id: '1', message: 'Turno confirmado', userId: 'user1' },
        { id: '2', message: 'Turno cancelado', userId: 'user1' }
      ];

      mockNotificationService.getNotifications.mockResolvedValue(mockNotifications);

      actor = createActor(notificationMachine);
      actor.start();
      actor.send({ type: 'LOAD_NOTIFICATIONS', accessToken: 'token' });

      await vi.waitFor(() => {
        expect(actor.getSnapshot().value).toBe('showingNotifications');
      });

      expect(mockOrchestrator.sendToMachine).toHaveBeenCalledWith('uiMachine', {
        type: 'OPEN_SNACKBAR',
        message: 'Turno confirmado',
        severity: 'success'
      });
    });

    it('should show notification with warning severity for rejected messages', async () => {
      const mockNotifications = [
        { id: '1', message: 'Turno rechazada', userId: 'user1' }
      ];

      mockNotificationService.getNotifications.mockResolvedValue(mockNotifications);

      actor = createActor(notificationMachine);
      actor.start();
      actor.send({ type: 'LOAD_NOTIFICATIONS', accessToken: 'token' });

      await vi.waitFor(() => {
        expect(actor.getSnapshot().value).toBe('showingNotifications');
      });

      expect(mockOrchestrator.sendToMachine).toHaveBeenCalledWith('uiMachine', {
        type: 'OPEN_SNACKBAR',
        message: 'Turno rechazada',
        severity: 'warning'
      });
    });

    it('should show notification with warning severity for cancelled messages', async () => {
      const mockNotifications = [
        { id: '1', message: 'Turno cancelado', userId: 'user1' }
      ];

      mockNotificationService.getNotifications.mockResolvedValue(mockNotifications);

      actor = createActor(notificationMachine);
      actor.start();
      actor.send({ type: 'LOAD_NOTIFICATIONS', accessToken: 'token' });

      await vi.waitFor(() => {
        expect(actor.getSnapshot().value).toBe('showingNotifications');
      });

      expect(mockOrchestrator.sendToMachine).toHaveBeenCalledWith('uiMachine', {
        type: 'OPEN_SNACKBAR',
        message: 'Turno cancelado',
        severity: 'warning'
      });
    });

    it('should not crash when notifications array is empty', async () => {
      mockNotificationService.getNotifications.mockResolvedValue([]);

      actor = createActor(notificationMachine);
      actor.start();
      actor.send({ type: 'LOAD_NOTIFICATIONS', accessToken: 'token' });

      await vi.waitFor(() => {
        expect(actor.getSnapshot().value).toBe('showingNotifications');
      });

      // Should not call sendToMachine when no notifications
      expect(mockOrchestrator.sendToMachine).not.toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ type: 'OPEN_SNACKBAR' })
      );
    });

    it('should handle NOTIFICATION_CLOSED event', async () => {
      const mockNotifications = [
        { id: '1', message: 'Turno confirmado', userId: 'user1' }
      ];

      mockNotificationService.getNotifications.mockResolvedValue(mockNotifications);

      actor = createActor(notificationMachine);
      actor.start();
      actor.send({ type: 'LOAD_NOTIFICATIONS', accessToken: 'token' });

      await vi.waitFor(() => {
        expect(actor.getSnapshot().value).toBe('showingNotifications');
      });

      mockOrchestrator.sendToMachine.mockClear();
      actor.send({ type: 'NOTIFICATION_CLOSED' });

      expect(mockOrchestrator.sendToMachine).toHaveBeenCalledWith(NOTIFICATION_MACHINE_ID, {
        type: 'DELETE_NOTIFICATION',
        notificationId: '1'
      });
    });

    it('should update index and maintain state', async () => {
      const mockNotifications = [
        { id: '1', message: 'First notification', userId: 'user1' },
        { id: '2', message: 'Second notification', userId: 'user1' }
      ];

      mockNotificationService.getNotifications.mockResolvedValue(mockNotifications);

      actor = createActor(notificationMachine);
      actor.start();
      actor.send({ type: 'LOAD_NOTIFICATIONS', accessToken: 'token' });

      await vi.waitFor(() => {
        expect(actor.getSnapshot().value).toBe('showingNotifications');
      });

      // Test index update
      actor.send({ type: 'UPDATE_INDEX', index: 1 });

      expect(actor.getSnapshot().context.currentNotificationIndex).toBe(1);
      expect(actor.getSnapshot().value).toBe('showingNotifications');
    });

    it('should maintain notifications array in state', async () => {
      const mockNotifications = [
        { id: '1', message: 'Only notification', userId: 'user1' }
      ];

      mockNotificationService.getNotifications.mockResolvedValue(mockNotifications);

      actor = createActor(notificationMachine);
      actor.start();
      actor.send({ type: 'LOAD_NOTIFICATIONS', accessToken: 'token' });

      await vi.waitFor(() => {
        expect(actor.getSnapshot().value).toBe('showingNotifications');
      });

      expect(actor.getSnapshot().context.notifications).toEqual(mockNotifications);
      expect(actor.getSnapshot().context.currentNotificationIndex).toBe(0);
    });

    it('should handle LOAD_NOTIFICATIONS to reload notifications', async () => {
      const mockNotifications = [
        { id: '1', message: 'First load', userId: 'user1' }
      ];

      mockNotificationService.getNotifications.mockResolvedValue(mockNotifications);

      actor = createActor(notificationMachine);
      actor.start();
      actor.send({ type: 'LOAD_NOTIFICATIONS', accessToken: 'token' });

      await vi.waitFor(() => {
        expect(actor.getSnapshot().value).toBe('showingNotifications');
      });

      // Reload notifications
      actor.send({ type: 'LOAD_NOTIFICATIONS', accessToken: 'new-token' });

      expect(actor.getSnapshot().value).toBe('loadingNotifications');
    });
  });

  describe('deletingNotification state', () => {
    it('should successfully delete notification and show remaining notification', async () => {
      const mockNotifications = [
        { id: '1', message: 'First notification', userId: 'user1' },
        { id: '2', message: 'Second notification', userId: 'user1' }
      ];

      mockNotificationService.getNotifications.mockResolvedValue(mockNotifications);
      mockNotificationService.deleteNotification.mockResolvedValue(undefined);

      actor = createActor(notificationMachine);
      actor.start();
      actor.send({ type: 'LOAD_NOTIFICATIONS', accessToken: 'token' });

      await vi.waitFor(() => {
        expect(actor.getSnapshot().value).toBe('showingNotifications');
      });

      mockOrchestrator.sendToMachine.mockClear();
      actor.send({ type: 'DELETE_NOTIFICATION', notificationId: '1' });

      await vi.waitFor(() => {
        expect(actor.getSnapshot().value).toBe('showingNotifications');
      });

      expect(mockNotificationService.deleteNotification).toHaveBeenCalledWith('1', 'token');
      
      // After deletion, array should have one notification left
      expect(actor.getSnapshot().context.notifications).toHaveLength(1);
      expect(actor.getSnapshot().context.notifications[0].id).toBe('2');
      expect(actor.getSnapshot().context.currentNotificationIndex).toBe(0);
      
      // Should show the remaining notification automatically
      expect(mockOrchestrator.sendToMachine).toHaveBeenCalledWith('uiMachine', {
        type: 'OPEN_SNACKBAR',
        message: 'Second notification',
        severity: 'success'
      });
    });

    it('should send ALL_NOTIFICATIONS_SHOWN when no more notifications', async () => {
      const mockNotifications = [
        { id: '1', message: 'Last notification', userId: 'user1' }
      ];

      mockNotificationService.getNotifications.mockResolvedValue(mockNotifications);
      mockNotificationService.deleteNotification.mockResolvedValue(undefined);

      actor = createActor(notificationMachine);
      actor.start();
      actor.send({ type: 'LOAD_NOTIFICATIONS', accessToken: 'token' });

      await vi.waitFor(() => {
        expect(actor.getSnapshot().value).toBe('showingNotifications');
      });

      mockOrchestrator.sendToMachine.mockClear();
      actor.send({ type: 'DELETE_NOTIFICATION', notificationId: '1' });

      await vi.waitFor(() => {
        expect(actor.getSnapshot().value).toBe('showingNotifications');
      });

      expect(mockOrchestrator.sendToMachine).toHaveBeenCalledWith(NOTIFICATION_MACHINE_ID, {
        type: 'ALL_NOTIFICATIONS_SHOWN'
      });
    });

    it('should handle deletion error and remove notification optimistically', async () => {
      const mockNotifications = [
        { id: '1', message: 'First notification', userId: 'user1' },
        { id: '2', message: 'Second notification', userId: 'user1' }
      ];

      mockNotificationService.getNotifications.mockResolvedValue(mockNotifications);
      mockNotificationService.deleteNotification.mockRejectedValue(new Error('Delete failed'));

      actor = createActor(notificationMachine);
      actor.start();
      actor.send({ type: 'LOAD_NOTIFICATIONS', accessToken: 'token' });

      await vi.waitFor(() => {
        expect(actor.getSnapshot().value).toBe('showingNotifications');
      });

      mockOrchestrator.sendToMachine.mockClear();
      actor.send({ type: 'DELETE_NOTIFICATION', notificationId: '1' });

      await vi.waitFor(() => {
        expect(actor.getSnapshot().value).toBe('showingNotifications');
      });

      // Even on error, notification should be removed (optimistic update)
      expect(actor.getSnapshot().context.notifications).toHaveLength(1);
      expect(actor.getSnapshot().context.notifications[0].id).toBe('2');
      
      // Should show remaining notification
      expect(mockOrchestrator.sendToMachine).toHaveBeenCalledWith('uiMachine', {
        type: 'OPEN_SNACKBAR',
        message: 'Second notification',
        severity: 'success'
      });
    });

    it('should send ALL_NOTIFICATIONS_SHOWN on error when no more notifications', async () => {
      const mockNotifications = [
        { id: '1', message: 'Last notification', userId: 'user1' }
      ];

      mockNotificationService.getNotifications.mockResolvedValue(mockNotifications);
      mockNotificationService.deleteNotification.mockRejectedValue(new Error('Delete failed'));

      actor = createActor(notificationMachine);
      actor.start();
      actor.send({ type: 'LOAD_NOTIFICATIONS', accessToken: 'token' });

      await vi.waitFor(() => {
        expect(actor.getSnapshot().value).toBe('showingNotifications');
      });

      mockOrchestrator.sendToMachine.mockClear();
      actor.send({ type: 'DELETE_NOTIFICATION', notificationId: '1' });

      await vi.waitFor(() => {
        expect(actor.getSnapshot().value).toBe('showingNotifications');
      });

      // Should not have any notifications left
      expect(actor.getSnapshot().context.notifications).toHaveLength(0);
      
      // Should not call OPEN_SNACKBAR when no notifications left
      expect(mockOrchestrator.sendToMachine).not.toHaveBeenCalledWith(
        'uiMachine',
        expect.objectContaining({ type: 'OPEN_SNACKBAR' })
      );
    });
  });

  describe('global events', () => {
    beforeEach(() => {
      actor = createActor(notificationMachine);
      actor.start();
    });

    it('should handle UPDATE_INDEX event', () => {
      actor.send({ type: 'UPDATE_INDEX', index: 5 });

      expect(actor.getSnapshot().context.currentNotificationIndex).toBe(5);
    });

    it('should handle ALL_NOTIFICATIONS_SHOWN event', () => {
      // Set up some notifications first
      actor = createActor(notificationMachine, {
        input: {
          notifications: [
            { id: '1', message: 'Test', userId: 'user1' },
            { id: '2', message: 'Test 2', userId: 'user1' }
          ],
          currentNotificationIndex: 1,
          isLoading: false,
          error: null,
          accessToken: 'token'
        }
      });
      actor.start();

      actor.send({ type: 'ALL_NOTIFICATIONS_SHOWN' });

      expect(actor.getSnapshot().context.notifications).toEqual([]);
      expect(actor.getSnapshot().context.currentNotificationIndex).toBe(0);
    });
  });

  describe('context management', () => {
    it('should maintain accessToken across state transitions', async () => {
      const mockNotifications = [
        { id: '1', message: 'Test notification', userId: 'user1' }
      ];

      mockNotificationService.getNotifications.mockResolvedValue(mockNotifications);

      actor = createActor(notificationMachine);
      actor.start();
      actor.send({ type: 'LOAD_NOTIFICATIONS', accessToken: 'my-token' });

      await vi.waitFor(() => {
        expect(actor.getSnapshot().value).toBe('showingNotifications');
      });

      expect(actor.getSnapshot().context.accessToken).toBe('my-token');
      expect(actor.getSnapshot().context.notifications).toEqual(mockNotifications);
    });

    it('should reset currentNotificationIndex when loading new notifications', async () => {
      const mockNotifications = [
        { id: '1', message: 'Test', userId: 'user1' }
      ];

      mockNotificationService.getNotifications.mockResolvedValue(mockNotifications);

      actor = createActor(notificationMachine, {
        input: {
          notifications: [],
          currentNotificationIndex: 5,
          isLoading: false,
          error: null,
          accessToken: null
        }
      });
      actor.start();

      actor.send({ type: 'LOAD_NOTIFICATIONS', accessToken: 'token' });

      await vi.waitFor(() => {
        expect(actor.getSnapshot().value).toBe('showingNotifications');
      });

      expect(actor.getSnapshot().context.currentNotificationIndex).toBe(0);
    });
  });
});
