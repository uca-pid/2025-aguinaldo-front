import { DELAY_CONFIGS, withDevDelay } from '#/utils/devDelay';
import { API_CONFIG, buildApiUrl, getAuthenticatedFetchOptions } from '../../config/api';
import type {
    PendingDoctor,
    DoctorApprovalResponse,
    AdminStats,
    ApiErrorResponse
} from '../models/Admin';

export class AdminService {


  static async getPendingDoctors(accessToken: string): Promise<PendingDoctor[]> {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.GET_PENDING_DOCTORS);
    
    try {
      const response = await  fetch(url, {
        ...getAuthenticatedFetchOptions(accessToken),
        method: 'GET',
      });

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.message || 
          errorData?.error ||
          `Failed to fetch pending doctors! Status: ${response.status}`
        );
      }

      const result: PendingDoctor[] = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to fetch pending doctors:', error);
      throw error;
    }
  }


  static async approveDoctor(doctorId: string, accessToken: string): Promise<DoctorApprovalResponse> {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.APPROVE_DOCTOR.replace('{doctorId}', doctorId));
    
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
          `Failed to approve doctor! Status: ${response.status}`
        );
      }

      const result: DoctorApprovalResponse = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to approve doctor:', error);
      throw error;
    }
  }


  static async rejectDoctor(doctorId: string, accessToken: string): Promise<DoctorApprovalResponse> {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.REJECT_DOCTOR.replace('{doctorId}', doctorId));
    
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
          `Failed to reject doctor! Status: ${response.status}`
        );
      }

      const result: DoctorApprovalResponse = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to reject doctor:', error);
      throw error;
    }
  }


  static async getAdminStats(accessToken: string): Promise<AdminStats> {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.GET_ADMIN_STATS);
    
    try {
      const response = await  fetch(url, {
        ...getAuthenticatedFetchOptions(accessToken),
        method: 'GET',
      });

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.message || 
          errorData?.error ||
          `Failed to fetch admin stats! Status: ${response.status}`
        );
      }

      const result: AdminStats = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
      // Return default values if there's an error
      return {
        patients: 0,
        doctors: 0,
        pending: 0
      };
    }
  }
}