import { API_CONFIG, buildApiUrl, getAuthenticatedFetchOptions } from '../../config/api';
import type { TurnModifyRequest } from '../models/TurnModifyRequest';

export interface TurnModifyCreateRequest {
  turnId: string;
  newScheduledAt: string;
}

export class TurnModifyService {
  static async createModifyRequest(
    request: TurnModifyCreateRequest,
    accessToken: string
  ): Promise<TurnModifyRequest> {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.MODIFY_TURN_REQUEST);

    try {
      const response = await fetch(url, {
        ...getAuthenticatedFetchOptions(accessToken),
        method: 'POST',
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[TurnModifyService] createModifyRequest - Error:', errorData);
        throw new Error(
          errorData?.message ||
          errorData?.error ||
          `Failed to create modify request! Status: ${response.status}`
        );
      }

      const result: TurnModifyRequest = await response.json();
      return result;
    } catch (error) {
      console.error('[TurnModifyService] createModifyRequest - Exception:', error);
      throw error;
    }
  }

  static async getMyModifyRequests(accessToken: string): Promise<TurnModifyRequest[]> {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.GET_MY_MODIFY_REQUESTS);

    try {
      const response = await  fetch(url, {
        ...getAuthenticatedFetchOptions(accessToken),
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[TurnModifyService] getMyModifyRequests - Error:', errorData);
        throw new Error(
          errorData?.message ||
          errorData?.error ||
          `Failed to fetch modify requests! Status: ${response.status}`
        );
      }

      const result: TurnModifyRequest[] = await  response.json();
      return result;
    } catch (error) {
      console.error('[TurnModifyService] getMyModifyRequests - Exception:', error);
      throw error;
    }
  }
}