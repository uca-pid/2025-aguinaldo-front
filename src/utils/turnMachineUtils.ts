import { TurnService } from "../service/turn-service.service";
import type { TurnResponse } from "../models/Turn";

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

/**
 * Reserve an existing turn
 */
export const reserveTurn = async ({ accessToken, userId, turnId }: ReserveTurnParams): Promise<TurnResponse> => {
  return await TurnService.reserveTurn(
    { turnId, patientId: userId },
    accessToken
  );
};

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