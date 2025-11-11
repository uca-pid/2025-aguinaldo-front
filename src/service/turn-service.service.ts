import { API_CONFIG, buildApiUrl, getAuthenticatedFetchOptions } from '../../config/api';
import { orchestrator } from '#/core/Orchestrator';
import dayjs from '#/utils/dayjs.config';
import type {
  Doctor,
  TurnCreateRequest,
  TurnResponse,
  ApiErrorResponse
} from '../models/Turn';
import type { TurnModifyRequest } from '../models/TurnModifyRequest';

async function handleAuthError(error: Response, retryFn?: () => Promise<any>): Promise<void> {
  if (error.status === 401) {
    orchestrator.sendToMachine('auth', { 
      type: 'HANDLE_AUTH_ERROR', 
      error,
      retryAction: retryFn 
    });
  }
}

export class TurnService {
  static async getMyModifyRequests(accessToken: string): Promise<TurnModifyRequest[]> {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.GET_MY_MODIFY_REQUESTS);
    try {
      const response = await fetch(url, {
        ...getAuthenticatedFetchOptions(accessToken),
        method: 'GET',
      });
      
      if (response.status === 401) {
        await handleAuthError(response, () => this.getMyModifyRequests(accessToken));
      }
      
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

  static async getDoctorModifyRequests(doctorId: string, accessToken: string): Promise<TurnModifyRequest[]> {
    let url = buildApiUrl(API_CONFIG.ENDPOINTS.GET_DOCTOR_MODIFY_REQUESTS);
    url = url.replace('{doctorId}', doctorId);
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
          `Failed to fetch doctor modify requests! Status: ${response.status}`
        );
      }

      const result: TurnModifyRequest[] = await response.json();
      return result;
    } catch (error) {
      console.error('[TurnService] getDoctorModifyRequests - Exception:', error);
      throw error;
    }
  }

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
      throw error;
    }
  }

  static async getAvailableTurns(
    doctorId: string, 
    date: string, 
    accessToken: string
  ): Promise<string[]> {
    // First, try to use cached slot data to avoid duplicate API calls
    const fromDate = dayjs().tz('America/Argentina/Buenos_Aires').format('YYYY-MM-DD');
    const toDate = dayjs().tz('America/Argentina/Buenos_Aires').add(60, 'day').format('YYYY-MM-DD');
    const cacheKey = `${doctorId}_${fromDate}_${toDate}`;
    const cached = this.availableSlotsCache.get(cacheKey);
    const now = Date.now();

    // If we have fresh cached data with slot details and occupancy info, use it directly
    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      const { slotsByDate } = this.processSlotsData(cached.slots);
      const slotsForDate = slotsByDate[date] || [];
      
      // Convert slots to time strings in OffsetDateTime format
      const argentinaOffset = '-03:00';
      const availableTimes = slotsForDate.map(slot => {
        // Format: YYYY-MM-DDTHH:mm:ss±HH:mm
        return `${slot.date}T${slot.startTime}${argentinaOffset}`;
      });
      
      return availableTimes;
    }

    // If no cache, fetch fresh data using the optimized endpoint
    try {
      const { slotsByDate } = await this.getAvailableDatesAndSlots(doctorId, accessToken);
      const slotsForDate = slotsByDate[date] || [];
      
      // Convert slots to time strings in OffsetDateTime format
      const argentinaOffset = '-03:00';
      const availableTimes = slotsForDate.map(slot => {
        return `${slot.date}T${slot.startTime}${argentinaOffset}`;
      });
      
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
      const response = await  fetch(url, {
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

      const result: TurnResponse[] = await  response.json();
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Cache for available slots to avoid duplicate API calls
  private static availableSlotsCache: Map<string, { slots: any[], timestamp: number }> = new Map();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Optimized method that fetches available slots with occupancy information in a single API call
   * This replaces the need for separate getAvailableDates and getAvailableTurns calls
   */
  static async getAvailableDatesAndSlots(doctorId: string, accessToken: string): Promise<{ dates: string[], slotsByDate: Record<string, any[]> }> {
    const fromDate = dayjs().tz('America/Argentina/Buenos_Aires').format('YYYY-MM-DD');
    const toDate = dayjs().tz('America/Argentina/Buenos_Aires').add(60, 'day').format('YYYY-MM-DD');
    
    // Check cache first
    const cacheKey = `${doctorId}_${fromDate}_${toDate}`;
    const cached = this.availableSlotsCache.get(cacheKey);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      return this.processSlotsData(cached.slots);
    }

    // Use the new optimized endpoint that includes occupancy information
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.GET_DOCTOR_AVAILABLE_SLOTS_WITH_OCCUPANCY.replace('{doctorId}', doctorId) + `?fromDate=${fromDate}&toDate=${toDate}`);
    
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
          `Failed to fetch available slots! Status: ${response.status}`
        );
      }
      const slots: any[] = await response.json();
      
      // Cache the slots
      this.availableSlotsCache.set(cacheKey, { slots, timestamp: now });
      
      return this.processSlotsData(slots);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Process slots data to extract dates and group slots by date
   * Only returns dates that have at least one available (non-occupied) slot
   */
  private static processSlotsData(slots: any[]): { dates: string[], slotsByDate: Record<string, any[]> } {
    const slotsByDate: Record<string, any[]> = {};
    
    // Group slots by date and filter out occupied ones
    slots.forEach(slot => {
      if (slot.date && slot.isOccupied === false) {
        if (!slotsByDate[slot.date]) {
          slotsByDate[slot.date] = [];
        }
        slotsByDate[slot.date].push(slot);
      }
    });
    
    // Only include dates that have at least one available slot
    const dates: string[] = Object.keys(slotsByDate).sort();
    return { dates, slotsByDate };
  }

  static async getAvailableDates(doctorId: string, accessToken: string): Promise<string[]> {
    const result = await this.getAvailableDatesAndSlots(doctorId, accessToken);
    return result.dates;
  }

  static async createModifyRequest(
    data: { turnId: string; newScheduledAt: string }, 
    accessToken: string
  ): Promise<any> {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.MODIFY_TURN_REQUEST);
    
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
          `Failed to create modify request! Status: ${response.status}`
        );
      }
      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async approveModifyRequest(requestId: string, accessToken: string): Promise<any> {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.APPROVE_MODIFY_REQUEST.replace('{requestId}', requestId));
    try {
      const response = await fetch(url, {
        ...getAuthenticatedFetchOptions(accessToken),
        method: 'POST',
      });
      
      if (response.status === 401) {
        await handleAuthError(response, () => this.approveModifyRequest(requestId, accessToken));
      }
      
      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.message || 
          errorData?.error ||
          `Failed to approve modify request! Status: ${response.status}`
        );
      }
      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async rejectModifyRequest(requestId: string, accessToken: string): Promise<any> {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.REJECT_MODIFY_REQUEST.replace('{requestId}', requestId));
    try {
      const response = await fetch(url, {
        ...getAuthenticatedFetchOptions(accessToken),
        method: 'POST',
      });
      
      if (response.status === 401) {
        await handleAuthError(response, () => this.rejectModifyRequest(requestId, accessToken));
      }
      
      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.message || 
          errorData?.error ||
          `Failed to reject modify request! Status: ${response.status}`
        );
      }
      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  }



  static async createRating(
    turnId: string,
    ratingData: { score: number; subcategories: string[] },
    accessToken: string
  ): Promise<any> {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.CREATE_RATING.replace('{turnId}', turnId));
    
    try {
      const response = await fetch(url, {
        ...getAuthenticatedFetchOptions(accessToken),
        method: 'POST',
        body: JSON.stringify(ratingData),
      });

      if (response.status === 401) {
        await handleAuthError(response, () => this.createRating(turnId, ratingData, accessToken));
      }

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json().catch(() => ({}));
        console.error('[TurnService] createRating - Error:', errorData);
        throw new Error(
          errorData?.message || 
          errorData?.error ||
          `Failed to create rating! Status: ${response.status}`
        );
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('[TurnService] createRating - Exception:', error);
      throw error;
    }
  }

  static async getRatingSubcategories(role?: string, accessToken?: string): Promise<string[]> {
    const url = role 
      ? `${buildApiUrl(API_CONFIG.ENDPOINTS.GET_RATING_SUBCATEGORIES)}?role=${encodeURIComponent(role)}`
      : buildApiUrl(API_CONFIG.ENDPOINTS.GET_RATING_SUBCATEGORIES);
    
    try {
      const options = accessToken 
        ? getAuthenticatedFetchOptions(accessToken)
        : { headers: { 'Content-Type': 'application/json' } };

      const response = await fetch(url, {
        ...options,
        method: 'GET',
      });

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json().catch(() => ({}));
        console.error('[TurnService] getRatingSubcategories - Error:', errorData);
        throw new Error(
          errorData?.message || 
          errorData?.error ||
          `Failed to fetch rating subcategories! Status: ${response.status}`
        );
      }

      const result: string[] = await response.json();
      return result;
    } catch (error) {
      console.error('[TurnService] getRatingSubcategories - Exception:', error);
      throw error;
    }
  }

  static async getRatedSubcategoryCounts(ratedId: string, accessToken?: string, raterRole?: string): Promise<{ subcategory: string | null; count: number }[]> {
    let url = buildApiUrl(API_CONFIG.ENDPOINTS.GET_RATED_SUBCATEGORY_COUNTS.replace('{ratedId}', ratedId));
    if (raterRole) {
      url = `${url}?raterRole=${encodeURIComponent(raterRole)}`;
    }

    try {
      const options = accessToken ? getAuthenticatedFetchOptions(accessToken) : { headers: { 'Content-Type': 'application/json' } };

      const response = await fetch(url, {
        ...options,
        method: 'GET',
      });

      if (response.status === 401) {
        await handleAuthError(response, () => this.getRatedSubcategoryCounts(ratedId, accessToken, raterRole));
      }

      if (!response.ok) {
        const errorData: any = await response.json().catch(() => ({}));
        console.error('[TurnService] getRatedSubcategoryCounts - Error:', errorData);
        throw new Error(errorData?.message || errorData?.error || `Failed to fetch subcategory counts! Status: ${response.status}`);
      }

      const result: { subcategory: string | null; count: number }[] = await response.json();
      return result;
    } catch (error) {
      console.error('[TurnService] getRatedSubcategoryCounts - Exception:', error);
      throw error;
    }
  }
}