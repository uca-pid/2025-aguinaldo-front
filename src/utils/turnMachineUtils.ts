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