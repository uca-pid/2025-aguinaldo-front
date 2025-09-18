export interface RegisterRequestData {
    name: string;
    surname: string;
    dni: string;
    gender: string;
    birthdate: string | null;
    email: string;
    password: string;
    password_confirm: string;
    phone: string;
    specialty: string | null;
    medicalLicense: string | null;
    slotDurationMin?: number | null;
  }

export interface RegisterResponse {
  id: string;
  email: string;
  name: string;
  surname: string;
  role: string;
  status: string;
  message: string;
}

export interface SignInRequestData {
  email: string;
  password: string;
}

export interface SignInResponse {
  id: string;
  email: string;
  name: string;
  surname: string;
  role: "PATIENT" | "DOCTOR" | "ADMIN";
  status: string;
  accessToken: string;
  refreshToken: string;
}

export interface ApiErrorResponse {
  message?: string;
  error?: string;
  status?: number;
}

export interface ProfileResponse{
  id:string;
  email: string;
  name: string;
  surname:string;
  dni:string;
  phone:string;
  birthdate:string | null;
  gender:string;
  role: "PATIENT" | "DOCTOR" | "ADMIN";
  status:string;

  medicalLicense?:string | null;
  specialty?:string | null;
  slotDurationMin?: number | null;
}
