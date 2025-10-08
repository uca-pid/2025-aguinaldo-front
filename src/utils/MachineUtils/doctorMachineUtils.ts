import { DoctorService, type DoctorAvailabilityRequest } from "../../service/doctor-service.service";
import { MedicalHistoryService } from "../../service/medical-history-service.service";
import type { Patient } from "../../models/Doctor";
import type { MedicalHistory, CreateMedicalHistoryRequest } from "../../models/MedicalHistory";



export interface UpdateMedicalHistoryParams {
  accessToken: string;
  doctorId: string;
  patientId: string;
  medicalHistory: string;
}

export interface AddMedicalHistoryParams {
  accessToken: string;
  doctorId: string;
  patientId: string;
  content: string;
}

export interface UpdateMedicalHistoryEntryParams {
  accessToken: string;
  doctorId: string;
  historyId: string;
  content: string;
}

export interface DeleteMedicalHistoryParams {
  accessToken: string;
  doctorId: string;
  historyId: string;
}

export interface LoadPatientMedicalHistoryParams {
  accessToken: string;
  patientId: string;
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
  return await  DoctorService.getAvailability(accessToken, doctorId);
};

export const updateMedicalHistory = async ({accessToken, doctorId, patientId, medicalHistory}: UpdateMedicalHistoryParams): Promise<MedicalHistory> => {
  // Since the new API works with individual entries, we'll add a new medical history entry
  const request: CreateMedicalHistoryRequest = {
    patientId,
    content: medicalHistory
  };
  
  return await MedicalHistoryService.addMedicalHistory(accessToken, doctorId, request);
}

export const addMedicalHistory = async ({accessToken, doctorId, patientId, content}: AddMedicalHistoryParams): Promise<MedicalHistory> => {
  const request: CreateMedicalHistoryRequest = {
    patientId,
    content
  };
  
  return await MedicalHistoryService.addMedicalHistory(accessToken, doctorId, request);
}

export const updateMedicalHistoryEntry = async ({accessToken, doctorId, historyId, content}: UpdateMedicalHistoryEntryParams): Promise<MedicalHistory> => {
  return await MedicalHistoryService.updateMedicalHistory(accessToken, doctorId, historyId, { content });
}

export const deleteMedicalHistory = async ({accessToken, doctorId, historyId}: DeleteMedicalHistoryParams): Promise<void> => {
  return await MedicalHistoryService.deleteMedicalHistory(accessToken, doctorId, historyId);
}

export const loadPatientMedicalHistory = async ({accessToken, patientId}: LoadPatientMedicalHistoryParams): Promise<MedicalHistory[]> => {
  return await MedicalHistoryService.getPatientMedicalHistory(accessToken, patientId);
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

  await  DoctorService.saveAvailability(accessToken, doctorId, availabilityRequest);
  return "Availability saved successfully";
};