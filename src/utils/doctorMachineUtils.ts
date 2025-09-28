import { DoctorService, type DoctorAvailabilityRequest } from "../service/doctor-service.service";
import type { Patient } from "../models/Doctor";

/**
 * Utility functions for doctorMachine service calls
 */

export interface UpdateMedicalHistoryParams {
  accessToken: string;
  doctorId: string;
  patientId: string;
  medicalHistory: string;
}

export interface LoadPatientsParams {
  accessToken: string;
  doctorId: string;
}

export interface LoadAvailabilityParams {
  accessToken: string;
  doctorId: string;
}

export interface SaveAvailabilityParams {
  accessToken: string;
  doctorId: string;
  availability: DayAvailability[];
}

interface Range {
  start: string;
  end: string;
}

interface DayAvailability {
  day: string;
  enabled: boolean;
  ranges: Range[];
}


export const loadDoctorPatients = async ({ accessToken, doctorId }: LoadPatientsParams): Promise<Patient[]> => {
  return await DoctorService.getDoctorPatients(accessToken, doctorId);
};


export const loadDoctorAvailability = async ({ accessToken, doctorId }: LoadAvailabilityParams) => {
  return await DoctorService.getAvailability(accessToken, doctorId);
};

export const updateMedicalHistory = async ({accessToken, doctorId, patientId, medicalHistory}: UpdateMedicalHistoryParams): Promise<void> => {
  return await DoctorService.updateMedicalHistory(accessToken, doctorId, patientId, medicalHistory);
}

export const saveDoctorAvailability = async ({ accessToken, doctorId, availability }: SaveAvailabilityParams): Promise<string> => {
  const dayMapping: { [key: string]: string } = {
    "LUNES": "MONDAY",
    "MARTES": "TUESDAY", 
    "MIÉRCOLES": "WEDNESDAY",
    "MIERCOLES": "WEDNESDAY",
    "JUEVES": "THURSDAY",
    "VIERNES": "FRIDAY",
    "SÁBADO": "SATURDAY",
    "SABADO": "SATURDAY",
    "DOMINGO": "SUNDAY"
  };

  const availabilityRequest: DoctorAvailabilityRequest = {
    slotDurationMin: 30, 
    weeklyAvailability: availability.map((day: DayAvailability) => {
      const spanishDay = day.day.toUpperCase();
      const englishDay = dayMapping[spanishDay] || spanishDay;
            
      return {
        day: englishDay,
        enabled: day.enabled,
        ranges: (day.ranges || []).filter(range => {
          if (!range.start || !range.end) return false;
          
          const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
          const isValidStart = timeRegex.test(range.start);
          const isValidEnd = timeRegex.test(range.end);
          
          if (!isValidStart || !isValidEnd) {
            console.warn(`Invalid time format: start=${range.start}, end=${range.end}`);
            return false;
          }
          
          return true;
        })
      };
    })
  };

  await DoctorService.saveAvailability(accessToken, doctorId, availabilityRequest);
  return "Availability saved successfully";
};