import { BadgeService } from "../../service/badge-service.service";
import type { Badge, BadgeProgress } from "../../models/Badge";

export interface LoadUserBadgesParams {
  accessToken: string;
  userId: string;
  userRole: string;
}

export interface LoadUserBadgeProgressParams {
  accessToken: string;
  userId: string;
  userRole: string;
}

export const loadUserBadges = async ({ accessToken, userId, userRole }: LoadUserBadgesParams): Promise<Badge[]> => {
  return await BadgeService.getUserBadges(accessToken, userId, userRole);
};

export const loadUserBadgeProgress = async ({ accessToken, userId, userRole }: LoadUserBadgeProgressParams): Promise<BadgeProgress[]> => {
  return await BadgeService.getUserBadgeProgress(accessToken, userId, userRole);
};