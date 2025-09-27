import { AdminService } from "../service/admin-service.service";
import { TurnService } from "../service/turn-service.service";
import type { PendingDoctor, AdminStats } from "../models/Admin";
import type { Doctor } from "../models/Turn";

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
  return await AdminService.getPendingDoctors(accessToken);
};

/**
 * Load admin statistics (admin only)
 */
export const loadAdminStats = async ({ accessToken, isAdmin }: LoadAdminStatsParams): Promise<AdminStats> => {
  if (!isAdmin) return { patients: 0, doctors: 0, pending: 0 };
  return await AdminService.getAdminStats(accessToken);
};

/**
 * Load available turns for a specific doctor and date
 */
export const loadAvailableTurns = async ({ accessToken, doctorId, date }: LoadAvailableTurnsParams): Promise<string[]> => {
  return await TurnService.getAvailableTurns(doctorId, date, accessToken);
};

/**
 * Load user's turns
 */
export const loadMyTurns = async ({ accessToken, status }: LoadMyTurnsParams): Promise<any[]> => {
  return await TurnService.getMyTurns(accessToken, status);
};