import { describe, it, expect, vi } from 'vitest';
import { BadgeService } from './badge-service.service';
import type { BadgeProgress } from '../models/Badge';
import { BadgeType, BadgeCategory } from '../models/Badge';

// Mock fetch globally
global.fetch = vi.fn();

describe('BadgeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCombinedBadgeData', () => {
    it('should fetch and return combined badge data', async () => {
      const mockResponse: BadgeProgress[] = [
        {
          badgeType: BadgeType.EXCEPTIONAL_COMMUNICATOR,
          badgeName: 'Comunicador Excepcional',
          category: BadgeCategory.QUALITY_OF_CARE,
          rarity: 'RARE',
          description: '40+ evaluaciones destacadas en comunicación',
          icon: '💬',
          color: '#4CAF50',
          criteria: 'Recibe 25 menciones positivas de comunicación en total',
          earned: true,
          progressPercentage: 100,
          statusMessage: '¡Logro obtenido!',
          earnedAt: '2024-01-01T00:00:00Z',
          isActive: true,
          lastEvaluatedAt: '2024-01-01T00:00:00Z'
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await BadgeService.getCombinedBadgeData('fake-token', 'doctor-1');

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/api/badges/doctor-1/progress', expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Authorization': 'Bearer fake-token'
        })
      }));
      expect(result.badges).toHaveLength(1);
      expect(result.progress).toEqual(mockResponse);
    });

    it('should throw error on fetch failure', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(BadgeService.getCombinedBadgeData('fake-token', 'doctor-1')).rejects.toThrow();
    });
  });

  describe('evaluateUserBadges', () => {
    it('should trigger badge evaluation successfully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true
      });

      await expect(BadgeService.evaluateUserBadges('fake-token', 'doctor-1')).resolves.toBeUndefined();

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/api/badges/doctor-1/evaluate', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer fake-token'
        })
      }));
    });

    it('should throw error on evaluation failure', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(BadgeService.evaluateUserBadges('fake-token', 'doctor-1')).rejects.toThrow();
    });
  });

  describe('formatEarnedDate', () => {
    it('should format today correctly', () => {
      const today = new Date().toISOString();
      const result = BadgeService.formatEarnedDate(today);

      expect(result).toBe('Hoy');
    });

    it('should format yesterday correctly', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const result = BadgeService.formatEarnedDate(yesterday.toISOString());

      expect(result).toBe('Ayer');
    });

    it('should format days ago correctly', () => {
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
      const result = BadgeService.formatEarnedDate(fiveDaysAgo.toISOString());

      expect(result).toBe('Hace 5 días');
    });

    it('should format weeks ago correctly', () => {
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      const result = BadgeService.formatEarnedDate(twoWeeksAgo.toISOString());

      expect(result).toBe('Hace 2 semanas');
    });

    it('should format months ago correctly', () => {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      const result = BadgeService.formatEarnedDate(threeMonthsAgo.toISOString());

      expect(result).toBe('Hace 3 meses');
    });

    it('should format years ago correctly', () => {
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      const result = BadgeService.formatEarnedDate(twoYearsAgo.toISOString());

      expect(result).toBe('Hace 2 años');
    });
  });
});