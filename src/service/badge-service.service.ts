import { API_CONFIG, buildApiUrl, getAuthenticatedFetchOptions } from '../../config/api';
import type {
  Badge,
  BadgeProgress,
  DoctorBadgesResponse,
  BadgeProgressResponse,
  ApiErrorResponse,
  BadgeStats,
  BadgeCategory,
  PatientBadge,
  PatientBadgeProgress,
  PatientBadgesResponse,
  PatientBadgeProgressResponse,
  PatientBadgeCategory
} from '../models/Badge';
import type { BadgeDTO } from '../models/Badge';
import { BADGE_METADATA, getBadgeMetadata } from '../models/Badge';
import { PATIENT_BADGE_METADATA, getPatientBadgeMetadata } from '../models/Badge';

export class BadgeService {
  static async getDoctorBadges(accessToken: string, doctorId: string): Promise<Badge[]> {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.GET_DOCTOR_BADGES.replace('{doctorId}', doctorId));
    
    try {
      const response = await fetch(url, {
        ...getAuthenticatedFetchOptions(accessToken),
        method: 'GET',
      });

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.message || 
          errorData?.error ||
          `Failed to fetch doctor badges! Status: ${response.status}`
        );
      }

      const result: DoctorBadgesResponse = await response.json();
      const allBadges: Badge[] = [];
      
      const badgeDTOs = [
        ...(result.qualityOfCareBadges || []),
        ...(result.professionalismBadges || []),
        ...(result.consistencyBadges || [])
      ];
      
      badgeDTOs.forEach((dto: BadgeDTO, index: number) => {
        if (dto.isActive) {
          allBadges.push({
            id: `${doctorId}-${dto.badgeType}-${index}`,
            doctorId: doctorId,
            badgeType: dto.badgeType,
            earnedAt: dto.earnedAt,
            isActive: dto.isActive,
            lastEvaluatedAt: dto.lastEvaluatedAt
          });
        }
      });
      
      return allBadges;
    } catch (error) {
      console.error('Failed to fetch doctor badges:', error);
      throw error;
    }
  }

  static async getBadgeProgress(accessToken: string, doctorId: string): Promise<BadgeProgress[]> {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.GET_DOCTOR_BADGE_PROGRESS.replace('{doctorId}', doctorId));
    
    try {
      const response = await fetch(url, {
        ...getAuthenticatedFetchOptions(accessToken),
        method: 'GET',
      });

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.message || 
          errorData?.error ||
          `Failed to fetch badge progress! Status: ${response.status}`
        );
      }

      const result: BadgeProgressResponse = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to fetch badge progress:', error);
      throw error;
    }
  }

  static async getUserBadges(accessToken: string, userId: string, userRole: string): Promise<Badge[]> {
    if (userRole === 'DOCTOR') {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.GET_DOCTOR_BADGES.replace('{doctorId}', userId));
    
      try {
        const response = await fetch(url, {
          ...getAuthenticatedFetchOptions(accessToken),
          method: 'GET',
        });

        if (!response.ok) {
          const errorData: ApiErrorResponse = await response.json().catch(() => ({}));
          throw new Error(
            errorData?.message || 
            errorData?.error ||
            `Failed to fetch doctor badges! Status: ${response.status}`
          );
        }

        const result: DoctorBadgesResponse = await response.json();
        
        const allBadges: Badge[] = [];
        
        const badgeDTOs = [
          ...(result.qualityOfCareBadges || []),
          ...(result.professionalismBadges || []),
          ...(result.consistencyBadges || [])
        ];
        
        badgeDTOs.forEach((dto: BadgeDTO, index: number) => {
          if (dto.isActive) {
            allBadges.push({
              id: `${userId}-${dto.badgeType}-${index}`,
              doctorId: userId,
              badgeType: dto.badgeType,
              earnedAt: dto.earnedAt,
              isActive: dto.isActive,
              lastEvaluatedAt: dto.lastEvaluatedAt
            });
          }
        });
        
        return allBadges;
      } catch (error) {
        console.error('Failed to fetch doctor badges:', error);
        throw error;
      }
    } else if (userRole === 'PATIENT') {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.GET_PATIENT_BADGES.replace('{patientId}', userId));
    
      try {
        const response = await fetch(url, {
          ...getAuthenticatedFetchOptions(accessToken),
          method: 'GET',
        });

        if (!response.ok) {
          const errorData: ApiErrorResponse = await response.json().catch(() => ({}));
          throw new Error(
            errorData?.message || 
            errorData?.error ||
            `Failed to fetch patient badges! Status: ${response.status}`
          );
        }

        const result: PatientBadgesResponse = await response.json();
        
        const allBadges: PatientBadge[] = [];
        
        const badgeDTOs = [
          ...(result.welcomeBadges || []),
          ...(result.preventiveCareBadges || []),
          ...(result.activeCommitmentBadges || []),
          ...(result.clinicalExcellenceBadges || [])
        ];
        
        badgeDTOs.forEach((dto: any, index: number) => {
          if (dto.isActive) {
            allBadges.push({
              id: `${userId}-${dto.badgeType}-${index}`,
              patientId: userId,
              badgeType: dto.badgeType,
              earnedAt: dto.earnedAt,
              isActive: dto.isActive,
              lastEvaluatedAt: dto.lastEvaluatedAt
            });
          }
        });
        
        // Convert PatientBadge[] to Badge[] for compatibility
        return allBadges.map(pb => ({
          id: pb.id,
          doctorId: pb.patientId, // Using doctorId field for patientId for compatibility
          badgeType: pb.badgeType as any, // Type assertion needed
          earnedAt: pb.earnedAt,
          isActive: pb.isActive,
          lastEvaluatedAt: pb.lastEvaluatedAt
        }));
      } catch (error) {
        console.error('Failed to fetch patient badges:', error);
        throw error;
      }
    }
    // For other roles, return empty array
    return [];
  }

  static async getUserBadgeProgress(accessToken: string, userId: string, userRole: string): Promise<BadgeProgress[]> {
    if (userRole === 'DOCTOR') {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.GET_DOCTOR_BADGE_PROGRESS.replace('{doctorId}', userId));
    
      try {
        const response = await fetch(url, {
          ...getAuthenticatedFetchOptions(accessToken),
          method: 'GET',
        });

        if (!response.ok) {
          const errorData: ApiErrorResponse = await response.json().catch(() => ({}));
          throw new Error(
            errorData?.message || 
            errorData?.error ||
            `Failed to fetch badge progress! Status: ${response.status}`
          );
        }

        const result: BadgeProgressResponse = await response.json();
        return result;
      } catch (error) {
        console.error('Failed to fetch badge progress:', error);
        throw error;
      }
    } else if (userRole === 'PATIENT') {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.GET_PATIENT_BADGE_PROGRESS.replace('{patientId}', userId));
    
      try {
        const response = await fetch(url, {
          ...getAuthenticatedFetchOptions(accessToken),
          method: 'GET',
        });

        if (!response.ok) {
          const errorData: ApiErrorResponse = await response.json().catch(() => ({}));
          throw new Error(
            errorData?.message || 
            errorData?.error ||
            `Failed to fetch patient badge progress! Status: ${response.status}`
          );
        }

        const result: PatientBadgeProgressResponse = await response.json();
        
        // Convert PatientBadgeProgress[] to BadgeProgress[] for compatibility
        return result.map(pp => ({
          badgeType: pp.badgeType as any, // Type assertion needed
          badgeName: pp.badgeName,
          category: pp.category as any, // Type assertion needed
          earned: pp.earned,
          progressPercentage: pp.progressPercentage,
          description: pp.description,
          statusMessage: pp.statusMessage
        }));
      } catch (error) {
        console.error('Failed to fetch patient badge progress:', error);
        throw error;
      }
    }
    // For other roles, return empty array
    return [];
  }

  /**
   * Trigger manual badge evaluation for a user
   */
  static async evaluateUserBadges(accessToken: string, userId: string, userRole: string): Promise<void> {
    let url: string;
    
    if (userRole === 'DOCTOR') {
      url = buildApiUrl(`/api/badges/doctor/${userId}/evaluate`);
    } else if (userRole === 'PATIENT') {
      url = buildApiUrl(`/api/badges/patient/${userId}/evaluate`);
    } else {
      throw new Error('Badge evaluation only supported for doctors and patients');
    }
    
    try {
      const response = await fetch(url, {
        ...getAuthenticatedFetchOptions(accessToken),
        method: 'POST',
      });

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.message || 
          errorData?.error ||
          `Failed to evaluate badges! Status: ${response.status}`
        );
      }
      
      console.log('Badge evaluation triggered successfully');
    } catch (error) {
      console.error('Failed to evaluate badges:', error);
      throw error;
    }
  }

  static calculateBadgeStats(
    badges: Badge[], 
    progress: BadgeProgress[],
    userRole: string = 'DOCTOR'
  ): BadgeStats {
    const totalAvailable = userRole === 'PATIENT' 
      ? Object.keys(PATIENT_BADGE_METADATA).length 
      : Object.keys(BADGE_METADATA).length;
    const totalEarned = badges.filter(b => b.isActive).length;
    const completionPercentage = totalAvailable > 0 
      ? Math.round((totalEarned / totalAvailable) * 100) 
      : 0;

    const recentlyEarned = [...badges]
      .filter(b => b.isActive)
      .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
      .slice(0, 5);

    const earnedBadgeTypes = new Set(badges.filter(b => b.isActive).map(b => b.badgeType));
    const closestToEarn = progress
      .filter(p => !earnedBadgeTypes.has(p.badgeType) && p.progressPercentage > 50)
      .sort((a, b) => b.progressPercentage - a.progressPercentage)
      .slice(0, 5);

    return {
      totalEarned,
      totalAvailable,
      completionPercentage,
      recentlyEarned,
      closestToEarn,
    };
  }

  static getBadgeProgressByType(
    progress: BadgeProgress[],
    badgeType: string
  ): BadgeProgress | undefined {
    return progress.find(p => p.badgeType === badgeType);
  }

  static isBadgeEarned(badges: Badge[], badgeType: string): boolean {
    return badges.some(b => b.badgeType === badgeType && b.isActive);
  }

  static isBadgeEarnedFromProgress(progress: BadgeProgress[], badgeType: string): boolean {
    const prog = progress.find(p => p.badgeType === badgeType);
    return prog?.earned === true;
  }

  static groupBadgesByCategory(badges: Badge[], userRole: string = 'DOCTOR'): Map<BadgeCategory | PatientBadgeCategory, Badge[]> {
    const grouped = new Map<BadgeCategory | PatientBadgeCategory, Badge[]>();
    
    badges.forEach(badge => {
      let category: BadgeCategory | PatientBadgeCategory;
      
      if (userRole === 'PATIENT') {
        const metadata = getPatientBadgeMetadata(badge.badgeType as any);
        category = metadata.category;
      } else {
        const metadata = getBadgeMetadata(badge.badgeType as any);
        category = metadata.category;
      }
      
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(badge);
    });
    
    return grouped;
  }

  static sortBadges(badges: Badge[], userRole: string = 'DOCTOR'): Badge[] {
    const rarityOrder = { LEGENDARY: 0, EPIC: 1, RARE: 2, COMMON: 3 };
    
    return [...badges].sort((a, b) => {
      let metadataA, metadataB;
      
      if (userRole === 'PATIENT') {
        metadataA = getPatientBadgeMetadata(a.badgeType as any);
        metadataB = getPatientBadgeMetadata(b.badgeType as any);
      } else {
        metadataA = getBadgeMetadata(a.badgeType as any);
        metadataB = getBadgeMetadata(b.badgeType as any);
      }
      
      const rarityDiff = rarityOrder[metadataA.rarity] - rarityOrder[metadataB.rarity];
      if (rarityDiff !== 0) return rarityDiff;
      
      return new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime();
    });
  }

  static formatEarnedDate(earnedAt: string): string {
    const date = new Date(earnedAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
    return `Hace ${Math.floor(diffDays / 365)} años`;
  }
}
