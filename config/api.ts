
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  
  ENDPOINTS: {
    // Auth endpoints
    REGISTER_PATIENT: '/api/auth/register/patient',
    REGISTER_DOCTOR: '/api/auth/register/doctor',
    SIGNIN: '/api/auth/signin',
    SIGNOUT: '/api/auth/signout',
    REFRESH_TOKEN: '/api/auth/refresh-token',
    
    // Turn endpoints
    CREATE_TURN: '/api/turns',
    RESERVE_TURN: '/api/turns/reserve',
    GET_AVAILABLE_TURNS: '/api/turns/available',
    GET_MY_TURNS: '/api/turns/my-turns',
    GET_DOCTOR_TURNS: '/api/turns/doctor',
    GET_PATIENT_TURNS: '/api/turns/patient',
    
    // Doctor endpoints
    GET_DOCTORS: '/api/doctors',
  },
  
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  
  TIMEOUT: 10000,
} as const;

export const buildApiUrl = (endpoint: string): string => {
  if (import.meta.env.DEV) {
    return endpoint;
  }
  
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