
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',

  ENDPOINTS: {
    REGISTER_PATIENT: '/api/auth/register/patient',
    REGISTER_DOCTOR: '/api/auth/register/doctor',
    SIGNIN: '/api/auth/signin',
    SIGNOUT: '/api/auth/signout',
    REFRESH_TOKEN: '/api/auth/refresh-token',

    CREATE_TURN: '/api/turns',
    RESERVE_TURN: '/api/turns/reserve',
    GET_AVAILABLE_TURNS: '/api/turns/available',
    GET_MY_TURNS: '/api/turns/my-turns',
    GET_DOCTOR_TURNS: '/api/turns/doctor',
    GET_PATIENT_TURNS: '/api/turns/patient',
    
    MODIFY_TURN_REQUEST: '/api/turns/modify-requests',
    GET_MY_MODIFY_REQUESTS: '/api/turns/modify-requests/my-requests',
    GET_DOCTOR_MODIFY_REQUESTS: '/api/turns/modify-requests/pending',
    DOCTOR_MODIFY_REQUEST: '/api/turns/modify-requests',
    
    GET_DOCTORS: '/api/doctors',
    GET_DOCTOR_PATIENTS: '/api/doctors/patients',

    GET_PENDING_DOCTORS: '/api/admin/pending-doctors',
    APPROVE_DOCTOR: '/api/admin/approve-doctor',
    REJECT_DOCTOR: '/api/admin/reject-doctor',
    GET_ADMIN_STATS: '/api/admin/stats',
  },

  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },

  TIMEOUT: 10000,
} as const;

export const buildApiUrl = (endpoint: string): string => {
  // Always use the full URL with base path
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export const getDefaultFetchOptions = (): RequestInit => ({
  headers: API_CONFIG.DEFAULT_HEADERS,
  signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
});

export const getAuthenticatedFetchOptions = (accessToken: string): RequestInit => ({
  headers: {
    ...API_CONFIG.DEFAULT_HEADERS,
    'Authorization': `Bearer ${accessToken}`,
  },
  signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
});

export const getAuthenticatedFetchOptionsWithRefreshToken = (accessToken: string, refreshToken: string): RequestInit => ({
  headers: {
    ...API_CONFIG.DEFAULT_HEADERS,
    'Authorization': `Bearer ${accessToken}`,
    'Refresh-Token': refreshToken,
  },
  signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
});