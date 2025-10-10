import { DoctorService, type DoctorAvailabilityRequest } from "../../service/doctor-service.service";
import { MedicalHistoryService } from "../../service/medical-history-service.service";
import type { Patient } from "../../models/Doctor";
import type { MedicalHistory, CreateMedicalHistoryRequest } from "../../models/MedicalHistory";



export interface UpdateMedicalHistoryParams {
  accessToken: string;
  doctorId: string;
  patientId: string;
  medicalHistory: string;
  turnId?: string; // Optional turn ID for turn-based medical history
}

export interface AddMedicalHistoryParams {
  accessToken: string;
  doctorId: string;
  turnId: string;
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

export interface LoadTurnMedicalHistoryParams {
  accessToken: string;
  turnId: string;
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












export const addMedicalHistory = async ({accessToken, doctorId, turnId, content}: AddMedicalHistoryParams): Promise<MedicalHistory> => {
  try {
    const request: CreateMedicalHistoryRequest = {
      turnId,
      content
    };

    console.log('Creating medical history entry for turn:', turnId);
    const result = await MedicalHistoryService.addMedicalHistory(accessToken, doctorId, request);
    console.log('Medical history entry created successfully:', result);
    return result;
  } catch (error) {
    console.error('Failed to add medical history:', error);
    throw error;
  }
}

export const updateMedicalHistory = async ({accessToken, doctorId, patientId, medicalHistory, turnId}: UpdateMedicalHistoryParams & {turnId?: string}): Promise<MedicalHistory> => {
  console.log('Updating medical history:', {
    patientId,
    turnId,
    content: medicalHistory?.substring(0, 20) + '...',
  });

  try {
    // Get all medical history entries for this patient
    const historyEntries = await MedicalHistoryService.getPatientMedicalHistory(accessToken, patientId);
    console.log(`Found ${historyEntries.length} history entries for patient`);
    
    // Check if turnId is provided - for turn-based medical history
    if (turnId) {
      console.log('Turn ID provided, looking for existing history for this turn');
      // Look for an existing medical history entry for this turn
      const turnEntry = historyEntries.find(entry => entry.turnId === turnId);
      
      if (turnEntry) {
        console.log('Found existing entry for turn, updating it');
        // Update the existing turn entry
        return await MedicalHistoryService.updateMedicalHistory(
          accessToken, 
          doctorId, 
          turnEntry.id, 
          { content: medicalHistory }
        );
      } else {
        console.log('No existing entry for turn, creating new one');
        // Create a new medical history entry for this turn
        return await addMedicalHistory({
          accessToken,
          doctorId,
          turnId,
          content: medicalHistory
        });
      }
    } else {
      console.log('No turn ID provided, using legacy behavior');
      // Legacy behavior for general patient medical history (not turn-specific)
      if (historyEntries.length > 0) {
        // Update the most recent entry
        const mostRecentEntry = historyEntries.sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )[0];
        
        console.log('Updating most recent entry:', mostRecentEntry.id);
        return await MedicalHistoryService.updateMedicalHistory(
          accessToken, 
          doctorId, 
          mostRecentEntry.id, 
          { content: medicalHistory }
        );
      } else {
        console.log('No history entries found for patient');
        // No existing history entries, but in this case we should create one
        if (turnId) {
          return await addMedicalHistory({
            accessToken,
            doctorId,
            turnId,
            content: medicalHistory
          });
        } else {
          // Really no way to create an entry without a turnId
          throw new Error("No medical history entries found for this patient and no turn ID provided");
        }
      }
    }
  } catch (error) {
    console.error('Error updating medical history:', error);
    throw error;
  }
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

export const loadTurnMedicalHistory = async ({accessToken, turnId, patientId}: LoadTurnMedicalHistoryParams): Promise<MedicalHistory[]> => {
  // Load all patient medical history and filter by turnId
  // Note: This approach works since medical history is now associated with specific turns
  const allHistory = await MedicalHistoryService.getPatientMedicalHistory(accessToken, patientId);
  return allHistory.filter((history) => history.turnId === turnId);
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

  return "Availability saved successfully";}