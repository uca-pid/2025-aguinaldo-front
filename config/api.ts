
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  
  ENDPOINTS: {
    REGISTER_PATIENT: '/api/auth/register/patient',
    REGISTER_DOCTOR: '/api/auth/register/doctor',
    SIGNIN: '/api/auth/signin',
    SIGNOUT: '/api/auth/signout',
    REFRESH_TOKEN: '/api/auth/refresh-token',
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