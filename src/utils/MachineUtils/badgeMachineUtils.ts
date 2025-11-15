import { BadgeService } from "../../service/badge-service.service";
import type { Badge, BadgeProgress } from "../../models/Badge";

export interface LoadCombinedBadgeDataParams {
  accessToken: string;
  userId: string;
}

export const loadCombinedBadgeData = async ({ accessToken, userId }: LoadCombinedBadgeDataParams): Promise<{
  badges: Badge[];
  progress: BadgeProgress[];
}> => {
  return await BadgeService.getCombinedBadgeData(accessToken, userId);
};