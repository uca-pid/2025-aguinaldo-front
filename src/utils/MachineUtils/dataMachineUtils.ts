import { AdminService } from "../../service/admin-service.service";
import { TurnService } from "../../service/turn-service.service";
import type { PendingDoctor, AdminStats } from "../../models/Admin";
import type { Doctor } from "../../models/Turn";

/**
 * Utility functions for dataMachine service calls
 */

export interface LoadDoctorsParams {
  accessToken: string;
}

export interface LoadPendingDoctorsParams {
  accessToken: string;
  isAdmin: boolean;
}

export interface LoadAdminStatsParams {
  accessToken: string;
  isAdmin: boolean;
}

export interface LoadAvailableTurnsParams {
  accessToken: string;
  doctorId: string;
  date: string;
}

export interface LoadMyTurnsParams {
  accessToken: string;
  status?: string;
}

export interface LoadDoctorModifiyRequestsParams {
  accessToken: string;
  doctorId: string;
}

export interface LoadMyModifyRequestsParams {
  accessToken: string;
}

export interface LoadTurnFilesParams {
  accessToken: string;
  turnIds: string[];
}

/**
 * Load all doctors
 */
export const loadDoctors = async ({ accessToken }: LoadDoctorsParams): Promise<Doctor[]> => {
  return await TurnService.getDoctors(accessToken);
};

/**
 * Load pending doctors (admin only)
 */
export const loadPendingDoctors = async ({ accessToken, isAdmin }: LoadPendingDoctorsParams): Promise<PendingDoctor[]> => {
  if (!isAdmin) return [];
  return await  AdminService.getPendingDoctors(accessToken);
};

/**
 * Load admin statistics (admin only)
 */
export const loadAdminStats = async ({ accessToken, isAdmin }: LoadAdminStatsParams): Promise<AdminStats> => {
  if (!isAdmin) return { patients: 0, doctors: 0, pending: 0 };
  return await  AdminService.getAdminStats(accessToken)
};

/**
 * Load available turns for a specific doctor and date
 */
export const loadAvailableTurns = async ({ accessToken, doctorId, date }: LoadAvailableTurnsParams): Promise<string[]> => {
  const result = await TurnService.getAvailableTurns(doctorId, date, accessToken);
  return result;
};

/**
 * Load user's turns
 */
export const loadMyTurns = async ({ accessToken, status }: LoadMyTurnsParams): Promise<any[]> => {
  return await TurnService.getMyTurns(accessToken, status);
};

/**
 * Load doctor's modify requests
 */
export const loadDoctorModifyRequests = async ({ accessToken, doctorId }: LoadDoctorModifiyRequestsParams): Promise<any[]> => {
  if (!doctorId) return [];
  return await TurnService.getDoctorModifyRequests(doctorId, accessToken);
};

/**
 * Load patient's own modify requests
 */
export const loadMyModifyRequests = async ({ accessToken }: LoadMyModifyRequestsParams): Promise<any[]> => {
  return await TurnService.getMyModifyRequests(accessToken);
};

/**
 * Load turn files information for all user's turns
 */
export const loadTurnFiles = async ({ accessToken, turnIds }: LoadTurnFilesParams): Promise<Record<string, any>> => {
  const { StorageService } = await import("../../service/storage-service.service");
  
  const turnFiles: Record<string, any> = {};
  
  // Load file info for each turn in parallel
  const filePromises = turnIds.map(async (turnId) => {
    try {
      const fileInfo = await StorageService.getTurnFileInfo(accessToken, turnId);
      if (fileInfo) {
        turnFiles[turnId] = fileInfo;
      } else {
        turnFiles[turnId] = null; // Explicitly mark as no file
      }
    } catch (error) {
      // Only log actual errors, not 404s for turns without files
      if (error instanceof Error && !error.message.includes('404')) {
        console.error(`❌ Failed to load file info for turn ${turnId}:`, error);
      }
      turnFiles[turnId] = null; // Mark as no file on error
    }
  });
  
  await Promise.all(filePromises);
  return turnFiles;
};