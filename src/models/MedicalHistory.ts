export interface MedicalHistory {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  patientId: string;
  patientName: string;
  patientSurname: string;
  doctorId: string;
  doctorName: string;
  doctorSurname: string;
}

export interface CreateMedicalHistoryRequest {
  patientId: string;
  content: string;
}

export interface UpdateMedicalHistoryContentRequest {
  content: string;
}

export interface ApiErrorResponse {
  error?: string;
  message?: string;
}