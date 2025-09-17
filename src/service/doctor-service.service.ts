import { buildApiUrl, getAuthenticatedFetchOptions } from '../../config/api';
import type { Patient, ApiErrorResponse } from '../models/Doctor';

export class DoctorService {
  
  static async getDoctorPatients(accessToken: string, doctorId: string): Promise<Patient[]> {
    const url = buildApiUrl(`/api/doctors/${doctorId}/patients`);
    
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
          `Failed to fetch doctor patients! Status: ${response.status}`
        );
      }

      const result: Patient[] = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to fetch doctor patients:', error);
      throw error;
    }
  }
}