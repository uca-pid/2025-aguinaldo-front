import { AdminService } from "../../service/admin-service.service";
import type { DoctorApprovalResponse } from "../../models/Admin";

/**
 * Utility functions for adminUserMachine service calls
 */

export interface ApproveDoctorParams {
  doctorId: string;
  accessToken: string;
}

export interface RejectDoctorParams {
  doctorId: string;
  accessToken: string;
}

/**
 * Approve a pending doctor registration
 */
export const approveDoctor = async ({ doctorId, accessToken }: ApproveDoctorParams): Promise<DoctorApprovalResponse> => {
  return await AdminService.approveDoctor(doctorId, accessToken);
};

/**
 * Reject a pending doctor registration
 */
export const rejectDoctor = async ({ doctorId, accessToken }: RejectDoctorParams): Promise<DoctorApprovalResponse> => {
  return await AdminService.rejectDoctor(doctorId, accessToken);
};