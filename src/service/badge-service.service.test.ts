import { describe, it, expect } from 'vitest';
import { BadgeService } from './badge-service.service';
import type {
  Badge,
  BadgeProgress,
} from '../models/Badge';
import { BadgeType, BadgeCategory } from '../models/Badge';

describe('BadgeService', () => {
  describe('calculateBadgeStats', () => {
    const mockBadges: Badge[] = [
      {
        id: 'badge-1',
        doctorId: 'doctor-1',
        badgeType: BadgeType.EXCEPTIONAL_COMMUNICATOR,
        earnedAt: '2024-01-01T00:00:00Z',
        isActive: true,
        lastEvaluatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'badge-2',
        doctorId: 'doctor-1',
        badgeType: BadgeType.EMPATHETIC_DOCTOR,
        earnedAt: '2024-01-02T00:00:00Z',
        isActive: true,
        lastEvaluatedAt: '2024-01-02T00:00:00Z'
      }
    ];

    const mockProgress: BadgeProgress[] = [
      {
        badgeType: BadgeType.PUNCTUALITY_PROFESSIONAL,
        badgeName: 'Profesional Puntual',
        category: BadgeCategory.QUALITY_OF_CARE,
        earned: false,
        progressPercentage: 80,
        description: '40+ evaluaciones destacadas en puntualidad',
        statusMessage: 'Progreso: 32/40 evaluaciones'
      },
      {
        badgeType: BadgeType.SUSTAINED_EXCELLENCE,
        badgeName: 'Excelencia Sostenida',
        category: BadgeCategory.QUALITY_OF_CARE,
        earned: false,
        progressPercentage: 60,
        description: 'Calificación promedio ≥4.7',
        statusMessage: 'Progreso: 3.8/4.7 promedio'
      }
    ];

    it('should calculate correct stats', () => {
      const result = BadgeService.calculateBadgeStats(mockBadges, mockProgress);

      expect(result.totalEarned).toBe(2);
      expect(result.totalAvailable).toBe(12);
      expect(result.completionPercentage).toBe(17);
      expect(result.recentlyEarned).toHaveLength(2);
      expect(result.closestToEarn).toHaveLength(2);
      expect(result.closestToEarn[0].badgeType).toBe(BadgeType.PUNCTUALITY_PROFESSIONAL);
      expect(result.closestToEarn[1].badgeType).toBe(BadgeType.SUSTAINED_EXCELLENCE);
    });

    it('should handle empty badges', () => {
      const result = BadgeService.calculateBadgeStats([], mockProgress);

      expect(result.totalEarned).toBe(0);
      expect(result.completionPercentage).toBe(0);
    });
  });

  describe('getBadgeProgressByType', () => {
    const mockProgress: BadgeProgress[] = [
      {
        badgeType: BadgeType.EXCEPTIONAL_COMMUNICATOR,
        badgeName: 'Comunicador Excepcional',
        category: BadgeCategory.QUALITY_OF_CARE,
        earned: false,
        progressPercentage: 75,
        description: '40+ evaluaciones destacadas en comunicación',
        statusMessage: 'Progreso: 30/40 evaluaciones'
      }
    ];

    it('should return progress for existing badge type', () => {
      const result = BadgeService.getBadgeProgressByType(mockProgress, BadgeType.EXCEPTIONAL_COMMUNICATOR);

      expect(result).toEqual(mockProgress[0]);
    });

    it('should return undefined for non-existing badge type', () => {
      const result = BadgeService.getBadgeProgressByType(mockProgress, BadgeType.EMPATHETIC_DOCTOR);

      expect(result).toBeUndefined();
    });
  });

  describe('isBadgeEarned', () => {
    const mockBadges: Badge[] = [
      {
        id: 'badge-1',
        doctorId: 'doctor-1',
        badgeType: BadgeType.EXCEPTIONAL_COMMUNICATOR,
        earnedAt: '2024-01-01T00:00:00Z',
        isActive: true,
        lastEvaluatedAt: '2024-01-01T00:00:00Z'
      }
    ];

    it('should return true for earned active badge', () => {
      const result = BadgeService.isBadgeEarned(mockBadges, BadgeType.EXCEPTIONAL_COMMUNICATOR);

      expect(result).toBe(true);
    });

    it('should return false for non-earned badge', () => {
      const result = BadgeService.isBadgeEarned(mockBadges, BadgeType.EMPATHETIC_DOCTOR);

      expect(result).toBe(false);
    });
  });

  describe('isBadgeEarnedFromProgress', () => {
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

    it('should return true for earned badge from progress', () => {
      const result = BadgeService.isBadgeEarnedFromProgress(mockProgress, BadgeType.EXCEPTIONAL_COMMUNICATOR);

      expect(result).toBe(true);
    });

    it('should return false for non-earned badge from progress', () => {
      const result = BadgeService.isBadgeEarnedFromProgress(mockProgress, BadgeType.EMPATHETIC_DOCTOR);

      expect(result).toBe(false);
    });
  });

  describe('groupBadgesByCategory', () => {
    const mockBadges: Badge[] = [
      {
        id: 'badge-1',
        doctorId: 'doctor-1',
        badgeType: BadgeType.EXCEPTIONAL_COMMUNICATOR,
        earnedAt: '2024-01-01T00:00:00Z',
        isActive: true,
        lastEvaluatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'badge-2',
        doctorId: 'doctor-1',
        badgeType: BadgeType.COMPLETE_DOCUMENTER,
        earnedAt: '2024-01-02T00:00:00Z',
        isActive: true,
        lastEvaluatedAt: '2024-01-02T00:00:00Z'
      }
    ];

    it('should group badges by category correctly', () => {
      const result = BadgeService.groupBadgesByCategory(mockBadges);

      expect(result.get(BadgeCategory.QUALITY_OF_CARE)).toHaveLength(1);
      expect(result.get(BadgeCategory.DOCUMENTATION)).toHaveLength(1);
      expect(result.get(BadgeCategory.QUALITY_OF_CARE)?.[0].badgeType).toBe(BadgeType.EXCEPTIONAL_COMMUNICATOR);
      expect(result.get(BadgeCategory.DOCUMENTATION)?.[0].badgeType).toBe(BadgeType.COMPLETE_DOCUMENTER);
    });
  });

  describe('sortBadges', () => {
    const mockBadges: Badge[] = [
      {
        id: 'badge-1',
        doctorId: 'doctor-1',
        badgeType: BadgeType.EXCEPTIONAL_COMMUNICATOR,
        earnedAt: '2024-01-02T00:00:00Z',
        isActive: true,
        lastEvaluatedAt: '2024-01-02T00:00:00Z'
      },
      {
        id: 'badge-2',
        doctorId: 'doctor-1',
        badgeType: BadgeType.MEDICAL_LEGEND,
        earnedAt: '2024-01-01T00:00:00Z',
        isActive: true,
        lastEvaluatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'badge-3',
        doctorId: 'doctor-1',
        badgeType: BadgeType.PUNCTUALITY_PROFESSIONAL,
        earnedAt: '2024-01-03T00:00:00Z',
        isActive: true,
        lastEvaluatedAt: '2024-01-03T00:00:00Z'
      }
    ];

    it('should sort badges by rarity then by earned date', () => {
      const result = BadgeService.sortBadges(mockBadges);

      expect(result[0].badgeType).toBe(BadgeType.MEDICAL_LEGEND);
      expect(result[1].badgeType).toBe(BadgeType.EXCEPTIONAL_COMMUNICATOR);
      expect(result[2].badgeType).toBe(BadgeType.PUNCTUALITY_PROFESSIONAL);
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