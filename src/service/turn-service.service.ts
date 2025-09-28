// Wrapper para fetch con manejo automático de refresh token
async function fetchWithRefresh(url: string, options: RequestInit): Promise<Response> {
  let response = await fetch(url, options);
  if (response.status === 401) {
    const authData = JSON.parse(localStorage.getItem('authData') || '{}');
    if (authData.refreshToken) {
      try {
        const { AuthService } = await import('./auth-service.service');
        const refreshed = await AuthService.refreshToken(authData.refreshToken);
        if (refreshed.accessToken) {
          localStorage.setItem('authData', JSON.stringify(refreshed));
          // Actualizar el header Authorization
          const newOptions = {
            ...options,
            headers: {
              ...options.headers,
              'Authorization': `Bearer ${refreshed.accessToken}`,
            },
          };
          response = await fetch(url, newOptions);
        }
      } catch (refreshError) {
        throw new Error('Sesión expirada. Por favor, vuelve a iniciar sesión.');
      }
    }
  }
  return response;
}
import { API_CONFIG, buildApiUrl, getAuthenticatedFetchOptions } from '../../config/api';
import type {
  Doctor,
  TurnCreateRequest,
  TurnReserveRequest,
  TurnResponse,
  ApiErrorResponse
} from '../models/Turn';
import type { TurnModifyRequest } from '../models/TurnModifyRequest';

export class TurnService {
  static async getMyModifyRequests(accessToken: string): Promise<TurnModifyRequest[]> {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.GET_MY_MODIFY_REQUESTS);
    try {
      const response = await fetchWithRefresh(url, {
        ...getAuthenticatedFetchOptions(accessToken),
        method: 'GET',
      });
      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json().catch(() => ({}));
        console.error('[TurnService] getMyModifyRequests - Error:', errorData);
        throw new Error(
          errorData?.message || 
          errorData?.error ||
          `Failed to fetch modify requests! Status: ${response.status}`
        );
      }
      const result: TurnModifyRequest[] = await response.json();
      return result;
    } catch (error) {
      console.error('[TurnService] getMyModifyRequests - Exception:', error);
      throw error;
    }
  }
  
  static async getDoctors(accessToken: string): Promise<Doctor[]> {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.GET_DOCTORS);
    
    try {
      const response = await fetchWithRefresh(url, {
        ...getAuthenticatedFetchOptions(accessToken),
        method: 'GET',
      });

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.message || 
          errorData?.error ||
          `Failed to fetch doctors! Status: ${response.status}`
        );
      }

      const result: Doctor[] = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async getAvailableTurns(
    doctorId: string, 
    date: string, 
    accessToken: string
  ): Promise<string[]> {
    const url = buildApiUrl(`/api/turns/available?doctorId=${doctorId}&date=${date}`);
    
    try {
      const response = await fetchWithRefresh(url, {
        ...getAuthenticatedFetchOptions(accessToken),
        method: 'GET',
      });
      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.message || 
          errorData?.error ||
          `Failed to fetch available turns! Status: ${response.status}`
        );
      }
      const availableTimes: string[] = await response.json();
      return availableTimes;
    } catch (error) {
      throw error;
    }
  }

  static async createTurn(
    data: TurnCreateRequest, 
    accessToken: string
  ): Promise<TurnResponse> {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.CREATE_TURN);
    
    try {
      const fetchOptions = {
        ...getAuthenticatedFetchOptions(accessToken),
        method: 'POST',
        body: JSON.stringify(data),
      };
      
      const response = await fetchWithRefresh(url, fetchOptions);

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json().catch(() => ({}));
        
        throw new Error(
          errorData?.message || 
          errorData?.error ||
          `Failed to create turn! Status: ${response.status}`
        );
      }

      const result: TurnResponse = await response.json();
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async reserveTurn(
    data: TurnReserveRequest, 
    accessToken: string
  ): Promise<TurnResponse> {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.RESERVE_TURN);
    
    try {
      const response = await fetchWithRefresh(url, {
        ...getAuthenticatedFetchOptions(accessToken),
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.message || 
          errorData?.error ||
          `Failed to reserve turn! Status: ${response.status}`
        );
      }

      const result: TurnResponse = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  }  static async getMyTurns(
    accessToken: string,
    status?: string
  ): Promise<TurnResponse[]> {
    const url = status 
      ? `${buildApiUrl(API_CONFIG.ENDPOINTS.GET_MY_TURNS)}?status=${status}`
      : buildApiUrl(API_CONFIG.ENDPOINTS.GET_MY_TURNS);
    try {
      const response = await fetchWithRefresh(url, {
        ...getAuthenticatedFetchOptions(accessToken),
        method: 'GET',
      });
      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json().catch(() => ({}));
        console.error('[TurnService] getMyTurns - Error:', errorData);
        throw new Error(
          errorData?.message || 
          errorData?.error ||
          `Failed to fetch my turns! Status: ${response.status}`
        );
      }
      const result: TurnResponse[] = await response.json();
      return result;
    } catch (error) {
        console.error('[TurnService] getMyTurns - Exception:', error);
      throw error;
    }
  }

  static async getPatientTurns(
    patientId: string,
    accessToken: string,
    status?: string
  ): Promise<TurnResponse[]> {
    const url = status 
      ? `${buildApiUrl(API_CONFIG.ENDPOINTS.GET_PATIENT_TURNS)}/${patientId}?status=${status}`
      : `${buildApiUrl(API_CONFIG.ENDPOINTS.GET_PATIENT_TURNS)}/${patientId}`;
    
    try {
      const response = await fetchWithRefresh(url, {
        ...getAuthenticatedFetchOptions(accessToken),
        method: 'GET',
      });

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.message || 
          errorData?.error ||
          `Failed to fetch patient turns! Status: ${response.status}`
        );
      }

      const result: TurnResponse[] = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async getDoctorTurns(
    doctorId: string,
    accessToken: string,
    status?: string
  ): Promise<TurnResponse[]> {
    const url = status 
      ? `${buildApiUrl(API_CONFIG.ENDPOINTS.GET_DOCTOR_TURNS)}/${doctorId}?status=${status}`
      : `${buildApiUrl(API_CONFIG.ENDPOINTS.GET_DOCTOR_TURNS)}/${doctorId}`;
    
    try {
      const response = await fetchWithRefresh(url, {
        ...getAuthenticatedFetchOptions(accessToken),
        method: 'GET',
      });

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.message || 
          errorData?.error ||
          `Failed to fetch doctor turns! Status: ${response.status}`
        );
      }

      const result: TurnResponse[] = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async getAvailableDates(doctorId: string, accessToken: string): Promise<string[]> {
    // Use available-slots endpoint with a 60-day range and extract unique dates
    const fromDate = new Date().toISOString().split('T')[0];
    const toDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const url = buildApiUrl(`/api/doctors/${doctorId}/available-slots?fromDate=${fromDate}&toDate=${toDate}`);
    
    try {
      const response = await fetchWithRefresh(url, {
        ...getAuthenticatedFetchOptions(accessToken),
        method: 'GET',
      });
      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.message || 
          errorData?.error ||
          `Failed to fetch available slots! Status: ${response.status}`
        );
      }
      const slots: any[] = await response.json();
      // Extract unique dates from slots
      const dateSet = new Set<string>();
      slots.forEach(slot => {
        if (slot.date) {
          dateSet.add(slot.date);
        }
      });
      const dates: string[] = Array.from(dateSet).sort();
      return dates;
    } catch (error) {
      throw error;
    }
  }

  static async createModifyRequest(
    data: { turnId: string; newScheduledAt: string }, 
    accessToken: string
  ): Promise<any> {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.MODIFY_TURN_REQUEST);
    
    try {
      const response = await fetchWithRefresh(url, {
        ...getAuthenticatedFetchOptions(accessToken),
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.message || 
          errorData?.error ||
          `Failed to create modify request! Status: ${response.status}`
        );
      }
      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async getDoctorAvailability(doctorId: string, accessToken: string): Promise<any> {
    try {
      const availableDates = await TurnService.getAvailableDates(doctorId, accessToken);
      return { availableDates };
    } catch (error) {
      throw error;
    }
  }
}