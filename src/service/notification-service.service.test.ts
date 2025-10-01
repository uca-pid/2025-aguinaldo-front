import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NotificationService } from './notification-service.service';
import type { NotificationResponse } from './notification-service.service';

// Mock the API config
vi.mock('../../config/api', () => ({
  API_CONFIG: {
    BASE_URL: 'http://localhost:8080',
    ENDPOINTS: {
      GET_NOTIFICATIONS: '/api/notifications',
      DELETE_NOTIFICATION: '/api/notifications/{notificationId}'
    },
    DEFAULT_HEADERS: {
      'Content-Type': 'application/json'
    }
  },
  buildApiUrl: vi.fn((endpoint: string) => `http://localhost:8080${endpoint}`),
  getAuthenticatedFetchOptions: vi.fn((token: string) => ({
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }))
}));

// Mock the orchestrator
vi.mock('#/core/Orchestrator', () => ({
  orchestrator: {
    sendToMachine: vi.fn()
  }
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('NotificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getNotifications', () => {
    const accessToken = 'access-token-123';
    const mockNotifications: NotificationResponse[] = [
      {
        id: '1',
        type: 'TURN_CANCELLED',
        relatedEntityId: 'turn-1',
        message: 'Your turn has been cancelled',
        isRead: false,
        createdAt: '2024-01-01T10:00:00Z'
      },
      {
        id: '2',
        type: 'MODIFY_REQUEST_APPROVED',
        relatedEntityId: 'modify-1',
        message: 'Your modification request has been approved',
        isRead: true,
        createdAt: '2024-01-02T11:00:00Z'
      }
    ];

    it('should successfully fetch notifications', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ notifications: mockNotifications })
      });

      const result = await NotificationService.getNotifications(accessToken);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/notifications',
        expect.objectContaining({
          method: 'GET'
        })
      );
      expect(result).toEqual(mockNotifications);
    });

    it('should handle 401 auth error and send to orchestrator', async () => {
      const authErrorResponse = { message: 'Unauthorized' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve(authErrorResponse)
      });

      await expect(NotificationService.getNotifications(accessToken))
        .rejects.toThrow('Unauthorized');

      // Verify orchestrator was called for auth error handling
      const { orchestrator } = await import('#/core/Orchestrator');
      expect(orchestrator.sendToMachine).toHaveBeenCalledWith('auth', {
        type: 'HANDLE_AUTH_ERROR',
        error: expect.objectContaining({ status: 401 }),
        retryAction: expect.any(Function)
      });
    });

    it('should throw error when fetch fails with non-401 error', async () => {
      const errorResponse = { message: 'Server error' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve(errorResponse)
      });

      await expect(NotificationService.getNotifications(accessToken))
        .rejects.toThrow('Server error');
    });

    it('should throw error with default message when response has no error details', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({})
      });

      await expect(NotificationService.getNotifications(accessToken))
        .rejects.toThrow('Failed to fetch notifications! Status: 404');
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(NotificationService.getNotifications(accessToken))
        .rejects.toThrow('Network error');
    });

    it('should throw error when response.json() fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      await expect(NotificationService.getNotifications(accessToken))
        .rejects.toThrow('Failed to fetch notifications! Status: 400');
    });
  });

  describe('deleteNotification', () => {
    const notificationId = 'notification-1';
    const accessToken = 'access-token-123';

    it('should successfully delete notification', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200
      });

      await expect(NotificationService.deleteNotification(notificationId, accessToken))
        .resolves.toBeUndefined();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/notifications/notification-1',
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });

    it('should handle 401 auth error and send to orchestrator', async () => {
      const authErrorResponse = { message: 'Unauthorized' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve(authErrorResponse)
      });

      await expect(NotificationService.deleteNotification(notificationId, accessToken))
        .rejects.toThrow('Unauthorized');

      // Verify orchestrator was called for auth error handling
      const { orchestrator } = await import('#/core/Orchestrator');
      expect(orchestrator.sendToMachine).toHaveBeenCalledWith('auth', {
        type: 'HANDLE_AUTH_ERROR',
        error: expect.objectContaining({ status: 401 }),
        retryAction: expect.any(Function)
      });
    });

    it('should throw error when delete fails with non-401 error', async () => {
      const errorResponse = { message: 'Notification not found' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve(errorResponse)
      });

      await expect(NotificationService.deleteNotification(notificationId, accessToken))
        .rejects.toThrow('Notification not found');
    });

    it('should throw error with default message when delete fails without error details', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({})
      });

      await expect(NotificationService.deleteNotification(notificationId, accessToken))
        .rejects.toThrow('Failed to delete notification! Status: 500');
    });

    it('should throw error when fetch fails during delete', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(NotificationService.deleteNotification(notificationId, accessToken))
        .rejects.toThrow('Network error');
    });
  });
});