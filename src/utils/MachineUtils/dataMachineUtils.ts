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
  return await TurnService.getAvailableTurns(doctorId, date, accessToken);
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