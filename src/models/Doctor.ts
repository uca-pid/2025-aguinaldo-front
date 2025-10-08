import type { MedicalHistory } from './MedicalHistory';

export interface Patient {
  id: string;
  name: string;
  surname: string;
  email: string;
  dni: number;
  phone?: string;
  birthdate?: string;
  gender?: string;
  status: string;
  medicalHistory?: string; // For backward compatibility - latest medical history content
  medicalHistories?: MedicalHistory[]; // New field for multiple medical history entries
}

export interface ApiErrorResponse {
  error?: string;
  message?: string;
}

export const calculateAge = (birthdate: string | undefined): number | null => {
  if (!birthdate) return null;
  
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};