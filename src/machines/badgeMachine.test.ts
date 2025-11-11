import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createActor } from 'xstate';
import badgeMachine, { BADGE_MACHINE_ID, BADGE_MACHINE_EVENT_TYPES } from './badgeMachine';
import type { Badge, BadgeProgress, BadgeStats } from '../models/Badge';
import { BadgeType, BadgeCategory } from '../models/Badge';

vi.mock('../service/badge-service.service', () => ({
  BadgeService: {
    getUserBadges: vi.fn(),
    getUserBadgeProgress: vi.fn(),
    evaluateUserBadges: vi.fn(),
    calculateBadgeStats: vi.fn()
  }
}));

vi.mock('#/core/Orchestrator', () => ({
  orchestrator: {
    sendToMachine: vi.fn(),
  }
}));

vi.mock('./uiMachine', () => ({
  UI_MACHINE_ID: 'ui'
}));

import { BadgeService } from '../service/badge-service.service';
import { orchestrator } from '#/core/Orchestrator';
import { UI_MACHINE_ID } from './uiMachine';

describe('badgeMachine', () => {
  let actor: ReturnType<typeof createActor<typeof badgeMachine>>;
  let mockBadgeService: any;
  let mockOrchestrator: any;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();

    mockBadgeService = vi.mocked(BadgeService);
    mockOrchestrator = vi.mocked(orchestrator);
  
    mockBadgeService.getUserBadges.mockResolvedValue([]);
    mockBadgeService.getUserBadgeProgress.mockResolvedValue([]);
    mockBadgeService.evaluateUserBadges.mockResolvedValue(undefined);
    mockBadgeService.calculateBadgeStats.mockReturnValue({
      totalEarned: 0,
      totalAvailable: 12,
      completionPercentage: 0,
      recentlyEarned: [],
      closestToEarn: []
    });

    actor = createActor(badgeMachine);
    actor.start();
  });

  afterEach(() => {
    vi.useRealTimers();
    actor.stop();
  });

  describe('initial state', () => {
    it('should start in idle state', () => {
      expect(actor.getSnapshot().value).toBe('idle');
    });

    it('should initialize with default context', () => {
      const context = actor.getSnapshot().context;
      expect(context.accessToken).toBeNull();
      expect(context.userRole).toBeNull();
      expect(context.userId).toBeNull();
      expect(context.badges).toEqual([]);
      expect(context.progress).toEqual([]);
      expect(context.stats).toBeNull();
      expect(context.isLoadingBadges).toBe(false);
      expect(context.isLoadingProgress).toBe(false);
      expect(context.isEvaluating).toBe(false);
      expect(context.badgesError).toBeNull();
      expect(context.progressError).toBeNull();
      expect(context.evaluationError).toBeNull();
      expect(context.lastLoadedAt).toBeNull();
    });
  });

  describe('SET_AUTH event', () => {
    it('should update auth context', () => {
      actor.send({
        type: 'SET_AUTH',
        accessToken: 'token123',
        userId: 'user123',
        userRole: 'DOCTOR'
      });

      const context = actor.getSnapshot().context;
      expect(context.accessToken).toBe('token123');
      expect(context.userId).toBe('user123');
      expect(context.userRole).toBe('DOCTOR');
    });
  });

  describe('RESET event', () => {
    it('should reset all context to initial values', () => {
    
      actor.send({
        type: 'SET_AUTH',
        accessToken: 'token123',
        userId: 'user123',
        userRole: 'DOCTOR'
      });
    
      actor.send({ type: 'RESET' });

      const context = actor.getSnapshot().context;
      expect(context.accessToken).toBeNull();
      expect(context.userRole).toBeNull();
      expect(context.userId).toBeNull();
      expect(context.badges).toEqual([]);
      expect(context.progress).toEqual([]);
      expect(context.stats).toBeNull();
      expect(context.badgesError).toBeNull();
      expect(context.progressError).toBeNull();
      expect(context.evaluationError).toBeNull();
      expect(context.lastLoadedAt).toBeNull();
      expect(context.isLoadingBadges).toBe(false);
      expect(context.isLoadingProgress).toBe(false);
      expect(context.isEvaluating).toBe(false);
    });
  });

  describe('idle state transitions', () => {
    it('should stay in idle when no auth data', () => {
      const newActor = createActor(badgeMachine);
      newActor.start();

      newActor.send({ type: 'LOAD_BADGES' });
      expect(newActor.getSnapshot().value).toBe('idle');
      newActor.stop();
    });

    it('should transition to loading when LOAD_BADGES with valid auth for eligible user', () => {
      actor.send({
        type: 'SET_AUTH',
        accessToken: 'token123',
        userId: 'user123',
        userRole: 'DOCTOR'
      });

      actor.send({ type: 'RESET' });
      actor.send({
        type: 'SET_AUTH',
        accessToken: 'token123',
        userId: 'user123',
        userRole: 'DOCTOR'
      });

      actor.send({ type: 'LOAD_BADGES' });
      expect(actor.getSnapshot().value).toEqual({
        loading: {
          loadingBadges: 'fetching',
          loadingProgress: 'fetching'
        }
      });
    });

    it('should transition to loading when LOAD_BADGES with valid auth for eligible user', () => {
      actor.send({
        type: 'SET_AUTH',
        accessToken: 'token123',
        userId: 'user123',
        userRole: 'DOCTOR'
      });
    
      actor.send({ type: 'RESET' });
      actor.send({
        type: 'SET_AUTH',
        accessToken: 'token123',
        userId: 'user123',
        userRole: 'DOCTOR'
      });

      actor.send({ type: 'LOAD_BADGES' });
      expect(actor.getSnapshot().value).toEqual({
        loading: {
          loadingBadges: 'fetching',
          loadingProgress: 'fetching'
        }
      });
    });

    it('should not transition for ineligible user role', () => {
      actor.send({
        type: 'SET_AUTH',
        accessToken: 'token123',
        userId: 'user123',
        userRole: 'INVALID_ROLE'
      });

      actor.send({ type: 'LOAD_BADGES' });
      expect(actor.getSnapshot().value).toBe('idle');
    });

    it('should auto-transition to loading when auth is set for eligible user', () => {
      actor.send({
        type: 'SET_AUTH',
        accessToken: 'token123',
        userId: 'user123',
        userRole: 'DOCTOR'
      });
    
      expect(actor.getSnapshot().value).toEqual({
        loading: {
          loadingBadges: 'fetching',
          loadingProgress: 'fetching'
        }
      });
    });
  });

  describe('evaluating state', () => {
    it('should set isEvaluating to true on entry', async () => {
      const testActor = createActor(badgeMachine);
      testActor.start();
      testActor.send({ type: 'RESET' });
      testActor.send({
        type: 'SET_AUTH',
        accessToken: 'token123',
        userId: 'user123',
        userRole: 'DOCTOR'
      });
      mockBadgeService.getUserBadges.mockResolvedValue([]);
      mockBadgeService.getUserBadgeProgress.mockResolvedValue([]);
      mockBadgeService.calculateBadgeStats.mockReturnValue({
        totalEarned: 0,
        totalAvailable: 12,
        completionPercentage: 0,
        recentlyEarned: [],
        closestToEarn: []
      });
      await vi.waitFor(() => {
        expect(testActor.getSnapshot().value).toBe('loaded');
      });
      testActor.send({ type: 'EVALUATE_BADGES' });
      expect(testActor.getSnapshot().value).toBe('evaluating');
      expect(testActor.getSnapshot().context.isEvaluating).toBe(true);
      expect(testActor.getSnapshot().context.evaluationError).toBeNull();
  testActor.stop();
    });

    it('should call BadgeService.evaluateUserBadges with correct parameters', async () => {
      const testActor = createActor(badgeMachine);
      testActor.start();

      testActor.send({ type: 'RESET' });
      testActor.send({
        type: 'SET_AUTH',
        accessToken: 'token123',
        userId: 'user123',
        userRole: 'DOCTOR'
      });

      mockBadgeService.getUserBadges.mockResolvedValue([]);
      mockBadgeService.getUserBadgeProgress.mockResolvedValue([]);
      mockBadgeService.calculateBadgeStats.mockReturnValue({
        totalEarned: 0,
        totalAvailable: 12,
        completionPercentage: 0,
        recentlyEarned: [],
        closestToEarn: []
      });

      await vi.waitFor(() => {
        expect(testActor.getSnapshot().value).toBe('loaded');
      });

      testActor.send({ type: 'EVALUATE_BADGES' });
  await vi.waitFor(() => {
        expect(mockBadgeService.evaluateUserBadges).toHaveBeenCalledWith(
          'token123',
          'user123',
          'DOCTOR'
        );
      });
  testActor.stop();
    });

    it('should transition to loading and show success message on successful evaluation', async () => {
      const testActor = createActor(badgeMachine);
      testActor.start();

      testActor.send({ type: 'RESET' });
      testActor.send({
        type: 'SET_AUTH',
        accessToken: 'token123',
        userId: 'user123',
        userRole: 'DOCTOR'
      });

      mockBadgeService.getUserBadges.mockResolvedValue([]);
      mockBadgeService.getUserBadgeProgress.mockResolvedValue([]);
      mockBadgeService.calculateBadgeStats.mockReturnValue({
        totalEarned: 0,
        totalAvailable: 12,
        completionPercentage: 0,
        recentlyEarned: [],
        closestToEarn: []
      });

      await vi.waitFor(() => {
        expect(testActor.getSnapshot().value).toBe('loaded');
      });

      testActor.send({ type: 'EVALUATE_BADGES' });

      await vi.waitFor(() => {
        expect(mockBadgeService.evaluateUserBadges).toHaveBeenCalledWith(
          'token123',
          'user123',
          'DOCTOR'
        );
      });

    
      await vi.waitFor(() => {
        expect(testActor.getSnapshot().value).toBe('loaded');
        expect(testActor.getSnapshot().context.isEvaluating).toBe(false);
        expect(testActor.getSnapshot().context.evaluationError).toBeNull();
      });

      expect(mockOrchestrator.sendToMachine).toHaveBeenCalledWith(UI_MACHINE_ID, {
        type: 'OPEN_SNACKBAR',
        message: 'Badges recalculados exitosamente',
        severity: 'success'
      });
  testActor.stop();
    });

    it('should handle evaluation error and show error message', async () => {
      const error = new Error('Evaluation failed');
      mockBadgeService.evaluateUserBadges.mockRejectedValueOnce(error);

      const testActor = createActor(badgeMachine);
      testActor.start();

      testActor.send({ type: 'RESET' });
      testActor.send({
        type: 'SET_AUTH',
        accessToken: 'token123',
        userId: 'user123',
        userRole: 'DOCTOR'
      });

      mockBadgeService.getUserBadges.mockResolvedValue([]);
      mockBadgeService.getUserBadgeProgress.mockResolvedValue([]);
      mockBadgeService.calculateBadgeStats.mockReturnValue({
        totalEarned: 0,
        totalAvailable: 12,
        completionPercentage: 0,
        recentlyEarned: [],
        closestToEarn: []
      });

      await vi.waitFor(() => {
        expect(testActor.getSnapshot().value).toBe('loaded');
      });

      testActor.send({ type: 'EVALUATE_BADGES' });

    
      await vi.waitFor(() => {
        expect(testActor.getSnapshot().value).toBe('idle');
        expect(testActor.getSnapshot().context.isEvaluating).toBe(false);
        expect(testActor.getSnapshot().context.evaluationError).toBe('Evaluation failed');
      });

      expect(mockOrchestrator.sendToMachine).toHaveBeenCalledWith(UI_MACHINE_ID, {
        type: 'OPEN_SNACKBAR',
        message: 'Evaluation failed',
        severity: 'error'
      });

      testActor.stop();
    });
  });

  describe('loading state', () => {
    it('should set loading flags on entry', () => {
      const testActor = createActor(badgeMachine);
      testActor.start();

      mockBadgeService.getUserBadges.mockResolvedValue([]);
      mockBadgeService.getUserBadgeProgress.mockResolvedValue([]);
      mockBadgeService.calculateBadgeStats.mockReturnValue({
        totalEarned: 0,
        totalAvailable: 12,
        completionPercentage: 0,
        recentlyEarned: [],
        closestToEarn: []
      });
  testActor.send({ type: 'RESET' });
      testActor.send({
        type: 'SET_AUTH',
        accessToken: 'token123',
        userId: 'user123',
        userRole: 'DOCTOR'
      });
      testActor.send({ type: 'LOAD_BADGES' });
  expect(testActor.getSnapshot().value).toEqual({
        loading: {
          loadingBadges: 'fetching',
          loadingProgress: 'fetching'
        }
      });
      expect(testActor.getSnapshot().context.isLoadingBadges).toBe(true);
      expect(testActor.getSnapshot().context.isLoadingProgress).toBe(true);
  testActor.stop();
    });

    it('should call BadgeService methods with correct parameters', async () => {
      const testActor = createActor(badgeMachine);
      testActor.start();

      mockBadgeService.getUserBadges.mockResolvedValue([]);
      mockBadgeService.getUserBadgeProgress.mockResolvedValue([]);
      mockBadgeService.calculateBadgeStats.mockReturnValue({
        totalEarned: 0,
        totalAvailable: 12,
        completionPercentage: 0,
        recentlyEarned: [],
        closestToEarn: []
      });
  testActor.send({ type: 'RESET' });
      testActor.send({
        type: 'SET_AUTH',
        accessToken: 'token123',
        userId: 'user123',
        userRole: 'DOCTOR'
      });
      testActor.send({ type: 'LOAD_BADGES' });
  await vi.waitFor(() => {
        expect(mockBadgeService.getUserBadges).toHaveBeenCalledWith('token123', 'user123', 'DOCTOR');
        expect(mockBadgeService.getUserBadgeProgress).toHaveBeenCalledWith('token123', 'user123', 'DOCTOR');
      });
  testActor.stop();
    });

    it('should handle successful loading and calculate stats', async () => {
      const mockBadges: Badge[] = [
        {
          id: 'badge-1',
          doctorId: 'user123',
          badgeType: BadgeType.EXCEPTIONAL_COMMUNICATOR,
          earnedAt: '2024-01-01T00:00:00Z',
          isActive: true,
          lastEvaluatedAt: '2024-01-01T00:00:00Z'
        }
      ];

      const mockProgress: BadgeProgress[] = [
        {
          badgeType: BadgeType.EXCEPTIONAL_COMMUNICATOR,
          badgeName: 'Comunicador Excepcional',
          category: BadgeCategory.QUALITY_OF_CARE,
          earned: true,
          progressPercentage: 100,
          description: '40+ evaluaciones destacadas en comunicación',
          statusMessage: '¡Logro obtenido!'
        }
      ];

      const mockStats: BadgeStats = {
        totalEarned: 1,
        totalAvailable: 12,
        completionPercentage: 8,
        recentlyEarned: mockBadges,
        closestToEarn: []
      };
    
      mockBadgeService.getUserBadges.mockResolvedValueOnce(mockBadges);
      mockBadgeService.getUserBadgeProgress.mockResolvedValueOnce(mockProgress);
      mockBadgeService.calculateBadgeStats.mockReturnValueOnce(mockStats);

      const testActor = createActor(badgeMachine);
      testActor.start();
      testActor.send({
        type: 'SET_AUTH',
        accessToken: 'token123',
        userId: 'user123',
        userRole: 'DOCTOR'
      });
      testActor.send({ type: 'RESET' });
      testActor.send({
        type: 'SET_AUTH',
        accessToken: 'token123',
        userId: 'user123',
        userRole: 'DOCTOR'
      });
      testActor.send({ type: 'LOAD_BADGES' });

      await vi.waitFor(() => {
        expect(testActor.getSnapshot().value).toBe('loaded');
        expect(testActor.getSnapshot().context.badges).toEqual(mockBadges);
        expect(testActor.getSnapshot().context.progress).toEqual(mockProgress);
        expect(testActor.getSnapshot().context.stats).toEqual(mockStats);
        expect(testActor.getSnapshot().context.isLoadingBadges).toBe(false);
        expect(testActor.getSnapshot().context.isLoadingProgress).toBe(false);
        expect(testActor.getSnapshot().context.lastLoadedAt).toBeDefined();
      });

      testActor.stop();
    });

    it('should handle badges loading error', async () => {
      const error = new Error('Network error');
    
      mockBadgeService.getUserBadges.mockRejectedValueOnce(error);
      mockBadgeService.getUserBadgeProgress.mockResolvedValueOnce([]);

      const testActor = createActor(badgeMachine);
      testActor.start();

      testActor.send({
        type: 'SET_AUTH',
        accessToken: 'token123',
        userId: 'user123',
        userRole: 'DOCTOR'
      });
      testActor.send({ type: 'RESET' });
      testActor.send({
        type: 'SET_AUTH',
        accessToken: 'token123',
        userId: 'user123',
        userRole: 'DOCTOR'
      });
      testActor.send({ type: 'LOAD_BADGES' });

      await vi.waitFor(() => {
        expect(testActor.getSnapshot().context.badges).toEqual([]);
        expect(testActor.getSnapshot().context.badgesError).toBe('Network error');
        expect(testActor.getSnapshot().context.isLoadingBadges).toBe(false);
      });

      testActor.stop();
    });

    it('should handle progress loading error', async () => {
      const error = new Error('Network error');
    
      mockBadgeService.getUserBadges.mockResolvedValueOnce([]);
      mockBadgeService.getUserBadgeProgress.mockRejectedValueOnce(error);

      const testActor = createActor(badgeMachine);
      testActor.start();

      testActor.send({
        type: 'SET_AUTH',
        accessToken: 'token123',
        userId: 'user123',
        userRole: 'DOCTOR'
      });
      testActor.send({ type: 'RESET' });
      testActor.send({
        type: 'SET_AUTH',
        accessToken: 'token123',
        userId: 'user123',
        userRole: 'DOCTOR'
      });
      testActor.send({ type: 'LOAD_BADGES' });

      await vi.waitFor(() => {
        expect(testActor.getSnapshot().context.progress).toEqual([]);
        expect(testActor.getSnapshot().context.progressError).toBe('Network error');
        expect(testActor.getSnapshot().context.isLoadingProgress).toBe(false);
      });

      testActor.stop();
    });
  });

  describe('loaded state', () => {
    let loadedActor: ReturnType<typeof createActor<typeof badgeMachine>>;

    beforeEach(async () => {
      loadedActor = createActor(badgeMachine);
      loadedActor.start();

      loadedActor.send({
        type: 'SET_AUTH',
        accessToken: 'token123',
        userId: 'user123',
        userRole: 'DOCTOR'
      });
    
      mockBadgeService.getUserBadges.mockResolvedValueOnce([]);
      mockBadgeService.getUserBadgeProgress.mockResolvedValueOnce([]);
      mockBadgeService.calculateBadgeStats.mockReturnValueOnce({
        totalEarned: 0,
        totalAvailable: 12,
        completionPercentage: 0,
        recentlyEarned: [],
        closestToEarn: []
      });
    
      await vi.waitFor(() => {
        expect(loadedActor.getSnapshot().value).toBe('loaded');
      });
    });

    afterEach(() => {
      loadedActor.stop();
    });

    it('should transition to loading on RELOAD_BADGES', () => {
      loadedActor.send({ type: 'RELOAD_BADGES' });
      expect(loadedActor.getSnapshot().value).toEqual({
        loading: {
          loadingBadges: 'fetching',
          loadingProgress: 'fetching'
        }
      });
    });

    it('should transition to evaluating on EVALUATE_BADGES', () => {
      loadedActor.send({ type: 'EVALUATE_BADGES' });
      expect(loadedActor.getSnapshot().value).toBe('evaluating');
    });

    it('should handle DATA_LOADED event with recent data', () => {
      loadedActor.send({ type: 'DATA_LOADED' });
    
    });

    it('should trigger reload for old data', () => {    
      const newActor = createActor(badgeMachine);
      newActor.start();
    
      newActor.send({
        type: 'SET_AUTH',
        accessToken: 'token123',
        userId: 'user123',
        userRole: 'DOCTOR'
      });
    
      mockBadgeService.getUserBadges.mockResolvedValueOnce([]);
      mockBadgeService.getUserBadgeProgress.mockResolvedValueOnce([]);
      mockBadgeService.calculateBadgeStats.mockReturnValueOnce({
        totalEarned: 0,
        totalAvailable: 12,
        completionPercentage: 0,
        recentlyEarned: [],
        closestToEarn: []
      });
    
      vi.waitFor(() => {
        expect(newActor.getSnapshot().value).toBe('loaded');
      });    
    
      newActor.send({ type: 'DATA_LOADED' });
    
      vi.advanceTimersByTime(600);

      newActor.stop();
    });
  });

  describe('machine constants', () => {
    it('should export correct machine ID', () => {
      expect(BADGE_MACHINE_ID).toBe('badge');
    });

    it('should export correct event types', () => {
      expect(BADGE_MACHINE_EVENT_TYPES).toEqual([
        'SET_AUTH',
        'RESET',
        'LOAD_BADGES',
        'RELOAD_BADGES',
        'DATA_LOADED',
        'EVALUATE_BADGES',
      ]);
    });
  });

  describe('context persistence', () => {
    it('should maintain context across state transitions', () => {
      actor.send({
        type: 'SET_AUTH',
        accessToken: 'token123',
        userId: 'user123',
        userRole: 'DOCTOR'
      });

      expect(actor.getSnapshot().context.accessToken).toBe('token123');
      expect(actor.getSnapshot().context.userId).toBe('user123');
      expect(actor.getSnapshot().context.userRole).toBe('DOCTOR');
    });
  });
});