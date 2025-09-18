import { API_CONFIG, buildApiUrl, getAuthenticatedFetchOptions } from '../../config/api';
import type {
  Doctor,
  TurnCreateRequest,
  TurnReserveRequest,
  TurnResponse,
  ApiErrorResponse
} from '../models/Turn';

export class TurnService {
  
  static async getDoctors(accessToken: string): Promise<Doctor[]> {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.GET_DOCTORS);
    
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
          `Failed to fetch doctors! Status: ${response.status}`
        );
      }

      const result: Doctor[] = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
      throw error;
    }
  }

  static async getAvailableTurns(
    doctorId: string, 
    date: string, 
    accessToken: string
  ): Promise<string[]> {
    const url = buildApiUrl(`/api/turns/available?doctorId=${doctorId}&date=${date}`);
    
    console.log('Fetching available turns from:', url);
    console.log('Doctor ID:', doctorId, 'Date:', date);
    
    try {
      const response = await fetch(url, {
        ...getAuthenticatedFetchOptions(accessToken),
        method: 'GET',
      });

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(
          errorData?.message || 
          errorData?.error ||
          `Failed to fetch available turns! Status: ${response.status}`
        );
      }

      const availableTimes: string[] = await response.json();
      console.log('Available times from backend:', availableTimes);
      
      return availableTimes;
    } catch (error) {
      console.error('Failed to fetch available turns:', error);
      throw error;
    }
  }

  static async createTurn(
    data: TurnCreateRequest, 
    accessToken: string
  ): Promise<TurnResponse> {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.CREATE_TURN);
    
    console.log('Creating turn with data:', data);
    console.log('URL:', url);
    
    try {
      const fetchOptions = {
        ...getAuthenticatedFetchOptions(accessToken),
        method: 'POST',
        body: JSON.stringify(data),
      };
      
      console.log('Fetch options:', fetchOptions);
      console.log('Request body:', JSON.stringify(data, null, 2));
      
      const response = await fetch(url, fetchOptions);

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
      console.error('Failed to create turn:', error);
      throw error;
    }
  }

  static async reserveTurn(
    data: TurnReserveRequest, 
    accessToken: string
  ): Promise<TurnResponse> {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.RESERVE_TURN);
    
    try {
      const response = await fetch(url, {
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
      console.error('Failed to reserve turn:', error);
      throw error;
    }
  }

  static async getMyTurns(
    accessToken: string,
    status?: string
  ): Promise<TurnResponse[]> {
    const url = status 
      ? `${buildApiUrl(API_CONFIG.ENDPOINTS.GET_MY_TURNS)}?status=${status}`
      : buildApiUrl(API_CONFIG.ENDPOINTS.GET_MY_TURNS);
    
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
          `Failed to fetch my turns! Status: ${response.status}`
        );
      }

      const result: TurnResponse[] = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to fetch my turns:', error);
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
      const response = await fetch(url, {
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
      console.error('Failed to fetch patient turns:', error);
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
      const response = await fetch(url, {
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
      console.error('Failed to fetch doctor turns:', error);
      throw error;
    }
  }
}