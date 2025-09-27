import { AuthService } from "../service/auth-service.service";
import type { ProfileResponse } from "../models/Auth";
import type { ProfileMachineContext } from "../machines/profileMachine";

/**
 * Utility functions for profileMachine service calls
 */

export interface LoadProfileParams {
  accessToken: string;
  userId: string;
}

export interface UpdateProfileParams {
  accessToken: string;
  userId: string;
  formValues: ProfileMachineContext['formValues'];
}

export interface DeactivateAccountParams {
  accessToken: string;
}

/**
 * Load user profile data
 */
export const loadProfile = async ({ accessToken, userId }: LoadProfileParams): Promise<ProfileResponse> => {
  return await AuthService.getProfile(accessToken, userId);
};

/**
 * Update user profile
 */
export const updateProfile = async ({ accessToken, userId, formValues }: UpdateProfileParams): Promise<ProfileResponse> => {
  // Build update data from formValues
  const updateData: any = {};
  
  Object.keys(formValues).forEach(key => {
    const value = (formValues as any)[key];
    if (value !== null && value !== undefined && value !== '') {
      updateData[key] = value;
    }
  });

  return await AuthService.updateProfile(accessToken, userId, updateData);
};

/**
 * Deactivate user account
 */
export const deactivateAccount = async ({ accessToken }: DeactivateAccountParams): Promise<void> => {
  return await AuthService.deactivateAccount(accessToken);
};