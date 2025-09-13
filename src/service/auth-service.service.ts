import { API_CONFIG, buildApiUrl, getDefaultFetchOptions } from '../../config/api';
import type {
    RegisterRequestData,
    RegisterResponse,
    SignInRequestData,
    SignInResponse,
    ApiErrorResponse
} from '../models/Auth';

export class AuthService {

  static async registerPatient(data: RegisterRequestData): Promise<RegisterResponse> {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.REGISTER_PATIENT);
    
    try {
      const response = await fetch(url, {
        ...getDefaultFetchOptions(),
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.message || 
          errorData?.error ||
          `Patient registration failed! Status: ${response.status}`
        );
      }

      const result: RegisterResponse = await response.json();
      console.log('Patient registration successful:', result);
      return result;
    } catch (error) {
      console.error('Patient registration failed:', error);
      throw error;
    }
  }

  static async registerDoctor(data: RegisterRequestData): Promise<RegisterResponse> {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.REGISTER_DOCTOR);
    
    try {
      const response = await fetch(url, {
        ...getDefaultFetchOptions(),
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.message || 
          errorData?.error ||
          `Doctor registration failed! Status: ${response.status}`
        );
      }

      const result: RegisterResponse = await response.json();
      console.log('Doctor registration successful:', result);
      return result;
    } catch (error) {
      console.error('Doctor registration failed:', error);
      throw error;
    }
  }

  static async signIn(data: SignInRequestData): Promise<SignInResponse> {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.SIGNIN);
    
    try {
      const response = await fetch(url, {
        ...getDefaultFetchOptions(),
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.message || 
          errorData?.error ||
          'Invalid credentials'
        );
      }

      const result: SignInResponse = await response.json();
      console.log('Sign in successful:', result);
      
      return result;
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    }
  }

  static async signOut(refreshToken: string): Promise<void> {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.SIGNOUT);
    
    try {
      const response = await fetch(url, {
        ...getDefaultFetchOptions(),
        method: 'POST',
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          'Refresh-Token': refreshToken,
        },
      });

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.message || 
          errorData?.error ||
          `Sign out failed! Status: ${response.status}`
        );
      }

      console.log('Sign out successful');
      
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  }

  static async refreshToken(refreshToken: string): Promise<SignInResponse> {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.REFRESH_TOKEN);
    
    try {
      const response = await fetch(url, {
        ...getDefaultFetchOptions(),
        method: 'POST',
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          'Refresh-Token': refreshToken,
        },
      });

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.message || 
          errorData?.error ||
          'Token refresh failed'
        );
      }

      const result: SignInResponse = await response.json();
      console.log('Token refresh successful:', result);
      
      return result;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }
}