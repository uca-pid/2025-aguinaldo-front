import { TurnService } from "../../service/turn-service.service";
import type { TurnResponse } from "../../models/Turn";
import devDelay, { withDevDelay, DELAY_CONFIGS } from "../devDelay";

/**
 * Utility functions for turnMachine service calls
 */

export interface ReserveTurnParams {
  accessToken: string;
  userId: string;
  turnId: string;
}

export interface CreateTurnParams {
  accessToken: string;
  userId: string;
  doctorId: string;
  scheduledAt: string;
}

export interface CancelTurnParams {
  accessToken: string;
  turnId: string;
}

export interface ModifyTurnParams {
  accessToken: string;
  turnId: string;
  newScheduledAt: string;
}

export interface LoadTurnDetailsParams {
  turnId: string;
  accessToken: string;
}

export interface LoadDoctorAvailabilityParams {
  accessToken: string;
  doctorId: string;
}

export interface LoadAvailableSlotsParams {
  accessToken: string;
  doctorId: string;
  date: string;
}

/**
 * Create a new turn
 */
export const createTurn = async ({ accessToken, userId, doctorId, scheduledAt }: CreateTurnParams): Promise<TurnResponse> => {
  return await TurnService.createTurn(
    { 
      doctorId, 
      patientId: userId, 
      scheduledAt 
    },
    accessToken
  );
};

/**
 * Cancel a turn
 */
export const cancelTurn = async ({ accessToken, turnId }: CancelTurnParams): Promise<void> => {
  const response = await fetch(`/api/turns/${turnId}/cancel`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Failed to cancel turn: ${errorData}`);
  }
};

/**
 * Create a modify turn request
 */
export const createModifyTurnRequest = async ({ accessToken, turnId, newScheduledAt }: ModifyTurnParams): Promise<any> => {
  return await withDevDelay(() => TurnService.createModifyRequest({
    turnId,
    newScheduledAt
  }, accessToken));
};

/**
 * Load turn details from my-turns API
 */
export const loadTurnDetails = async ({ turnId, accessToken }: { turnId: string; accessToken: string }): Promise<TurnResponse | null> => {
  try {
    let response = await withDevDelay(() => fetch('/api/turns/my-turns', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }));

    if (response.status === 401) {
      // Intentar refresh token
      const authData = JSON.parse(localStorage.getItem('authData') || '{}');
      if (authData.refreshToken) {
        try {
          const { AuthService } = await import('../../service/auth-service.service');
          const refreshed = await AuthService.refreshToken(authData.refreshToken);
          if (refreshed.accessToken) {
            localStorage.setItem('authData', JSON.stringify(refreshed));
            response = await fetch('/api/turns/my-turns', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${refreshed.accessToken}`,
                'Content-Type': 'application/json'
              }
            });
          }
        } catch (refreshError) {
          console.error('Error al refrescar el token en loadTurnDetails:', refreshError);
          throw new Error('Sesión expirada. Por favor, vuelve a iniciar sesión.');
        }
      }
    }
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to load my turns: ${response.statusText} - ${errorData}`);
    }
    const myTurns: TurnResponse[] = await response.json();
    const turn = myTurns.find((turn: TurnResponse) => turn.id === turnId);
    if (!turn) {
      throw new Error(`Turn with ID ${turnId} not found in your turns`);
    }
    return turn;
  } catch (error) {
    console.error('Error loading turn details:', error);
    throw error;
  }
};

/**
 * Load doctor availability dates
 */
export const loadDoctorAvailability = async ({ accessToken, doctorId }: LoadDoctorAvailabilityParams): Promise<string[]> => {
  const availability = await withDevDelay(() => TurnService.getDoctorAvailability(doctorId, accessToken), DELAY_CONFIGS.VERY_SLOW);
  return availability?.availableDates || [];
};

/**
 * Load available time slots for a specific date and doctor
 */
export const loadAvailableSlots = async ({ accessToken, doctorId, date }: LoadAvailableSlotsParams): Promise<string[]> => {
  const slots = await withDevDelay(() => TurnService.getAvailableTurns(doctorId, date, accessToken), DELAY_CONFIGS.VERY_SLOW);
  return slots || [];
};