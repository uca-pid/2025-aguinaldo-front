export interface Doctor {
  id: string;
  name: string;
  surname: string;
  email: string;
  medicalLicense: string;
  specialty: string;
  slotDurationMin: number;
}

export interface TurnAvailable {
  id: string;
  doctorId: string;
  scheduledAt: string; 
}

export interface TurnAssigned {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  patientId: string;
  patientName: string;
  scheduledAt: string; 
  status: 'AVAILABLE' | 'RESERVED' | 'COMPLETED' | 'CANCELLED';
}

export interface TurnCreateRequest {
  doctorId: string;
  patientId: string;
  scheduledAt: string; 
}

export interface TurnResponse {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  patientId: string;
  patientName: string;
  scheduledAt: string;
  status: string;
}

export interface ApiErrorResponse {
  message?: string;
  error?: string;
  details?: string;
}