import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TurnService } from './turn-service.service';
import type {
  Doctor,
  TurnCreateRequest,
  TurnResponse
} from '../models/Turn';
import type { TurnModifyRequest } from '../models/TurnModifyRequest';

// Mock the API config
vi.mock('../../config/api', () => ({
  API_CONFIG: {
    BASE_URL: 'http://localhost:8080',
    ENDPOINTS: {
      GET_MY_MODIFY_REQUESTS: '/api/turns/modify-requests/my-requests',
      GET_DOCTOR_MODIFY_REQUESTS: '/api/turns/modify-requests/pending?doctorId={doctorId}',
      GET_DOCTORS: '/api/doctors',
      CREATE_TURN: '/api/turns',
      GET_MY_TURNS: '/api/turns/my-turns',
      GET_PATIENT_TURNS: '/api/turns/patient',
      GET_DOCTOR_TURNS: '/api/turns/doctor',
      MODIFY_TURN_REQUEST: '/api/turns/modify-requests',
      DOCTOR_MODIFY_REQUEST: '/api/turns/modify-requests',
      GET_AVAILABLE_TURNS: '/api/turns/available',
      CANCEL_TURN: '/api/turns/{turnId}/cancel',
      APPROVE_MODIFY_REQUEST: '/api/turns/modify-requests/{requestId}/approve',
      REJECT_MODIFY_REQUEST: '/api/turns/modify-requests/{requestId}/reject',
      GET_DOCTOR_AVAILABLE_SLOTS: '/api/doctors/{doctorId}/available-slots'
    },
    DEFAULT_HEADERS: {
      'Content-Type': 'application/json'
    }
  },
  buildApiUrl: vi.fn((endpoint: string) => `http://localhost:8080${endpoint}`),
  getAuthenticatedFetchOptions: vi.fn((token: string) => ({
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }))
}));

// Mock the orchestrator
vi.mock('#/core/Orchestrator', () => ({
  orchestrator: {
    sendToMachine: vi.fn()
  }
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('TurnService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getMyModifyRequests', () => {
    const accessToken = 'access-token-123';
    const mockModifyRequests: TurnModifyRequest[] = [
      {
        id: 'modify-1',
        turnId: 'turn-1',
        patientId: 'patient-1',
        doctorId: 'doctor-1',
        currentScheduledAt: '2024-01-10T10:00:00Z',
        requestedScheduledAt: '2024-01-15T10:00:00Z',
        status: 'PENDING'
      }
    ];

    it('should successfully fetch my modify requests', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockModifyRequests)
      });

      const result = await TurnService.getMyModifyRequests(accessToken);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/turns/modify-requests/my-requests',
        expect.objectContaining({
          method: 'GET'
        })
      );
      expect(result).toEqual(mockModifyRequests);
    });

    it('should handle 401 auth error and send to orchestrator', async () => {
      const authErrorResponse = { message: 'Unauthorized' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve(authErrorResponse)
      });

      await expect(TurnService.getMyModifyRequests(accessToken))
        .rejects.toThrow('Unauthorized');

      const { orchestrator } = await import('#/core/Orchestrator');
      expect(orchestrator.sendToMachine).toHaveBeenCalledWith('auth', {
        type: 'HANDLE_AUTH_ERROR',
        error: expect.objectContaining({ status: 401 }),
        retryAction: expect.any(Function)
      });
    });

    it('should throw error when fetch fails with non-401 error', async () => {
      const errorResponse = { message: 'Server error' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve(errorResponse)
      });

      await expect(TurnService.getMyModifyRequests(accessToken))
        .rejects.toThrow('Server error');
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(TurnService.getMyModifyRequests(accessToken))
        .rejects.toThrow('Network error');
    });
  });

  describe('getDoctorModifyRequests', () => {
    const doctorId = 'doctor-1';
    const accessToken = 'access-token-123';
    const mockModifyRequests: TurnModifyRequest[] = [
      {
        id: 'modify-1',
        turnId: 'turn-1',
        patientId: 'patient-1',
        doctorId: 'doctor-1',
        currentScheduledAt: '2024-01-10T10:00:00Z',
        requestedScheduledAt: '2024-01-15T10:00:00Z',
        status: 'PENDING'
      }
    ];

    it('should successfully fetch doctor modify requests', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockModifyRequests)
      });

      const result = await TurnService.getDoctorModifyRequests(doctorId, accessToken);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/turns/modify-requests/pending?doctorId=doctor-1',
        expect.objectContaining({
          method: 'GET'
        })
      );
      expect(result).toEqual(mockModifyRequests);
    });

    it('should throw error when fetch fails', async () => {
      const errorResponse = { message: 'Doctor not found' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve(errorResponse)
      });

      await expect(TurnService.getDoctorModifyRequests(doctorId, accessToken))
        .rejects.toThrow('Doctor not found');
    });

    it('should throw error when fetch fails during request', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(TurnService.getDoctorModifyRequests(doctorId, accessToken))
        .rejects.toThrow('Network error');
    });
  });

  describe('getDoctors', () => {
    const accessToken = 'access-token-123';
    const mockDoctors: Doctor[] = [
      {
        id: 'doctor-1',
        name: 'Dr. John',
        surname: 'Doe',
        email: 'john.doe@example.com',
        medicalLicense: 'LIC123456',
        specialty: 'Cardiology',
        slotDurationMin: 30
      },
      {
        id: 'doctor-2',
        name: 'Dr. Jane',
        surname: 'Smith',
        email: 'jane.smith@example.com',
        medicalLicense: 'LIC789012',
        specialty: 'Dermatology',
        slotDurationMin: 20
      }
    ];

    it('should successfully fetch doctors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDoctors)
      });

      const result = await TurnService.getDoctors(accessToken);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/doctors',
        expect.objectContaining({
          method: 'GET'
        })
      );
      expect(result).toEqual(mockDoctors);
    });

    it('should throw error when fetch fails', async () => {
      const errorResponse = { message: 'Unauthorized' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve(errorResponse)
      });

      await expect(TurnService.getDoctors(accessToken))
        .rejects.toThrow('Unauthorized');
    });

    it('should throw error when fetch fails during request', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(TurnService.getDoctors(accessToken))
        .rejects.toThrow('Network error');
    });
  });

  describe('getAvailableTurns', () => {
    const doctorId = 'doctor-1';
    const date = '2024-01-15';
    const accessToken = 'access-token-123';
    const mockAvailableTimes = ['09:00', '09:30', '10:00', '14:00', '14:30'];

    it('should successfully fetch available turns', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAvailableTimes)
      });

      const result = await TurnService.getAvailableTurns(doctorId, date, accessToken);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/turns/available?doctorId=doctor-1&date=2024-01-15',
        expect.objectContaining({
          method: 'GET'
        })
      );
      expect(result).toEqual(mockAvailableTimes);
    });

    it('should throw error when fetch fails', async () => {
      const errorResponse = { message: 'Doctor not found' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve(errorResponse)
      });

      await expect(TurnService.getAvailableTurns(doctorId, date, accessToken))
        .rejects.toThrow('Doctor not found');
    });

    it('should throw error when fetch fails during request', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(TurnService.getAvailableTurns(doctorId, date, accessToken))
        .rejects.toThrow('Network error');
    });
  });

  describe('createTurn', () => {
    const accessToken = 'access-token-123';
    const mockCreateRequest: TurnCreateRequest = {
      doctorId: 'doctor-1',
      patientId: 'patient-1',
      scheduledAt: '2024-01-15T10:00:00Z'
    };

    const mockTurnResponse: TurnResponse = {
      id: 'turn-1',
      doctorId: 'doctor-1',
      doctorName: 'Dr. John Doe',
      doctorSpecialty: 'Cardiology',
      patientId: 'patient-1',
      patientName: 'John Smith',
      scheduledAt: '2024-01-15T10:00:00Z',
      status: 'RESERVED'
    };

    it('should successfully create turn', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTurnResponse)
      });

      const result = await TurnService.createTurn(mockCreateRequest, accessToken);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/turns',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockCreateRequest)
        })
      );
      expect(result).toEqual(mockTurnResponse);
    });

    it('should throw error when create fails', async () => {
      const errorResponse = { message: 'Time slot not available' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: () => Promise.resolve(errorResponse)
      });

      await expect(TurnService.createTurn(mockCreateRequest, accessToken))
        .rejects.toThrow('Time slot not available');
    });

    it('should throw error when fetch fails during create', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(TurnService.createTurn(mockCreateRequest, accessToken))
        .rejects.toThrow('Network error');
    });
  });

  describe('getMyTurns', () => {
    const accessToken = 'access-token-123';
    const mockTurns: TurnResponse[] = [
      {
        id: 'turn-1',
        doctorId: 'doctor-1',
        doctorName: 'Dr. John Doe',
        doctorSpecialty: 'Cardiology',
        patientId: 'patient-1',
        patientName: 'John Smith',
        scheduledAt: '2024-01-15T10:00:00Z',
        status: 'RESERVED'
      }
    ];

    it('should successfully fetch my turns without status filter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTurns)
      });

      const result = await TurnService.getMyTurns(accessToken);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/turns/my-turns',
        expect.objectContaining({
          method: 'GET'
        })
      );
      expect(result).toEqual(mockTurns);
    });

    it('should successfully fetch my turns with status filter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTurns)
      });

      const result = await TurnService.getMyTurns(accessToken, 'RESERVED');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/turns/my-turns?status=RESERVED',
        expect.objectContaining({
          method: 'GET'
        })
      );
      expect(result).toEqual(mockTurns);
    });

    it('should throw error when fetch fails', async () => {
      const errorResponse = { message: 'Unauthorized' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve(errorResponse)
      });

      await expect(TurnService.getMyTurns(accessToken))
        .rejects.toThrow('Unauthorized');
    });

    it('should throw error when fetch fails during request', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(TurnService.getMyTurns(accessToken))
        .rejects.toThrow('Network error');
    });
  });

  describe('getPatientTurns', () => {
    const patientId = 'patient-1';
    const accessToken = 'access-token-123';
    const mockTurns: TurnResponse[] = [
      {
        id: 'turn-1',
        doctorId: 'doctor-1',
        doctorName: 'Dr. John Doe',
        doctorSpecialty: 'Cardiology',
        patientId: 'patient-1',
        patientName: 'John Smith',
        scheduledAt: '2024-01-15T10:00:00Z',
        status: 'RESERVED'
      }
    ];

    it('should successfully fetch patient turns without status filter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTurns)
      });

      const result = await TurnService.getPatientTurns(patientId, accessToken);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/turns/patient/patient-1',
        expect.objectContaining({
          method: 'GET'
        })
      );
      expect(result).toEqual(mockTurns);
    });

    it('should successfully fetch patient turns with status filter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTurns)
      });

      const result = await TurnService.getPatientTurns(patientId, accessToken, 'RESERVED');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/turns/patient/patient-1?status=RESERVED',
        expect.objectContaining({
          method: 'GET'
        })
      );
      expect(result).toEqual(mockTurns);
    });

    it('should throw error when fetch fails', async () => {
      const errorResponse = { message: 'Patient not found' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve(errorResponse)
      });

      await expect(TurnService.getPatientTurns(patientId, accessToken))
        .rejects.toThrow('Patient not found');
    });

    it('should throw error when fetch fails during request', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(TurnService.getPatientTurns(patientId, accessToken))
        .rejects.toThrow('Network error');
    });
  });

  describe('getDoctorTurns', () => {
    const doctorId = 'doctor-1';
    const accessToken = 'access-token-123';
    const mockTurns: TurnResponse[] = [
      {
        id: 'turn-1',
        doctorId: 'doctor-1',
        doctorName: 'Dr. John Doe',
        doctorSpecialty: 'Cardiology',
        patientId: 'patient-1',
        patientName: 'John Smith',
        scheduledAt: '2024-01-15T10:00:00Z',
        status: 'RESERVED'
      }
    ];

    it('should successfully fetch doctor turns without status filter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTurns)
      });

      const result = await TurnService.getDoctorTurns(doctorId, accessToken);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/turns/doctor/doctor-1',
        expect.objectContaining({
          method: 'GET'
        })
      );
      expect(result).toEqual(mockTurns);
    });

    it('should successfully fetch doctor turns with status filter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTurns)
      });

      const result = await TurnService.getDoctorTurns(doctorId, accessToken, 'RESERVED');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/turns/doctor/doctor-1?status=RESERVED',
        expect.objectContaining({
          method: 'GET'
        })
      );
      expect(result).toEqual(mockTurns);
    });

    it('should throw error when fetch fails', async () => {
      const errorResponse = { message: 'Doctor not found' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve(errorResponse)
      });

      await expect(TurnService.getDoctorTurns(doctorId, accessToken))
        .rejects.toThrow('Doctor not found');
    });

    it('should throw error when fetch fails during request', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(TurnService.getDoctorTurns(doctorId, accessToken))
        .rejects.toThrow('Network error');
    });
  });

  describe('getAvailableDates', () => {
    const doctorId = 'doctor-1';
    const accessToken = 'access-token-123';
    const mockSlots = [
      { date: '2024-01-15', startTime: '09:00', endTime: '09:30', dayOfWeek: 'MONDAY' },
      { date: '2024-01-15', startTime: '10:00', endTime: '10:30', dayOfWeek: 'MONDAY' },
      { date: '2024-01-16', startTime: '09:00', endTime: '09:30', dayOfWeek: 'TUESDAY' }
    ];

    it('should successfully fetch available dates', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSlots)
      });

      const result = await TurnService.getAvailableDates(doctorId, accessToken);

      expect(result).toEqual(['2024-01-15', '2024-01-16']);
    });

    it('should throw error when fetch fails', async () => {
      const errorResponse = { message: 'Doctor not found' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve(errorResponse)
      });

      await expect(TurnService.getAvailableDates(doctorId, accessToken))
        .rejects.toThrow('Doctor not found');
    });

    it('should throw error when fetch fails during request', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(TurnService.getAvailableDates(doctorId, accessToken))
        .rejects.toThrow('Network error');
    });
  });

  describe('createModifyRequest', () => {
    const accessToken = 'access-token-123';
    const mockModifyData = {
      turnId: 'turn-1',
      newScheduledAt: '2024-01-20T10:00:00Z'
    };

    const mockModifyResponse = {
      id: 'modify-1',
      turnId: 'turn-1',
      patientId: 'patient-1',
      doctorId: 'doctor-1',
      currentScheduledAt: '2024-01-15T10:00:00Z',
      requestedScheduledAt: '2024-01-20T10:00:00Z',
      status: 'PENDING'
    };

    it('should successfully create modify request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockModifyResponse)
      });

      const result = await TurnService.createModifyRequest(mockModifyData, accessToken);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/turns/modify-requests',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockModifyData)
        })
      );
      expect(result).toEqual(mockModifyResponse);
    });

    it('should throw error when create modify request fails', async () => {
      const errorResponse = { message: 'Turn not found' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve(errorResponse)
      });

      await expect(TurnService.createModifyRequest(mockModifyData, accessToken))
        .rejects.toThrow('Turn not found');
    });

    it('should throw error when fetch fails during modify request create', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(TurnService.createModifyRequest(mockModifyData, accessToken))
        .rejects.toThrow('Network error');
    });
  });

  describe('getDoctorAvailability', () => {
    const doctorId = 'doctor-1';
    const accessToken = 'access-token-123';

    it('should successfully get doctor availability', async () => {
      const mockSlots = [
        { date: '2024-01-15', startTime: '09:00', endTime: '09:30', dayOfWeek: 'MONDAY' }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSlots)
      });

      const result = await TurnService.getDoctorAvailability(doctorId, accessToken);

      expect(result).toEqual({ availableDates: ['2024-01-15'] });
    });

    it('should throw error when get doctor availability fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(TurnService.getDoctorAvailability(doctorId, accessToken))
        .rejects.toThrow('Network error');
    });
  });

  describe('approveModifyRequest', () => {
    const requestId = 'modify-1';
    const accessToken = 'access-token-123';
    const mockApproveResponse = {
      id: 'modify-1',
      status: 'APPROVED',
      message: 'Request approved successfully'
    };

    it('should successfully approve modify request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockApproveResponse)
      });

      const result = await TurnService.approveModifyRequest(requestId, accessToken);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/turns/modify-requests/modify-1/approve',
        expect.objectContaining({
          method: 'POST'
        })
      );
      expect(result).toEqual(mockApproveResponse);
    });

    it('should handle 401 auth error and send to orchestrator', async () => {
      const authErrorResponse = { message: 'Unauthorized' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve(authErrorResponse)
      });

      await expect(TurnService.approveModifyRequest(requestId, accessToken))
        .rejects.toThrow('Unauthorized');

      const { orchestrator } = await import('#/core/Orchestrator');
      expect(orchestrator.sendToMachine).toHaveBeenCalledWith('auth', {
        type: 'HANDLE_AUTH_ERROR',
        error: expect.objectContaining({ status: 401 }),
        retryAction: expect.any(Function)
      });
    });

    it('should throw error when approve fails with non-401 error', async () => {
      const errorResponse = { message: 'Request not found' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve(errorResponse)
      });

      await expect(TurnService.approveModifyRequest(requestId, accessToken))
        .rejects.toThrow('Request not found');
    });

    it('should throw error when fetch fails during approve', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(TurnService.approveModifyRequest(requestId, accessToken))
        .rejects.toThrow('Network error');
    });
  });

  describe('rejectModifyRequest', () => {
    const requestId = 'modify-1';
    const accessToken = 'access-token-123';
    const mockRejectResponse = {
      id: 'modify-1',
      status: 'REJECTED',
      message: 'Request rejected successfully'
    };

    it('should successfully reject modify request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockRejectResponse)
      });

      const result = await TurnService.rejectModifyRequest(requestId, accessToken);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/turns/modify-requests/modify-1/reject',
        expect.objectContaining({
          method: 'POST'
        })
      );
      expect(result).toEqual(mockRejectResponse);
    });

    it('should handle 401 auth error and send to orchestrator', async () => {
      const authErrorResponse = { message: 'Unauthorized' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve(authErrorResponse)
      });

      await expect(TurnService.rejectModifyRequest(requestId, accessToken))
        .rejects.toThrow('Unauthorized');

      const { orchestrator } = await import('#/core/Orchestrator');
      expect(orchestrator.sendToMachine).toHaveBeenCalledWith('auth', {
        type: 'HANDLE_AUTH_ERROR',
        error: expect.objectContaining({ status: 401 }),
        retryAction: expect.any(Function)
      });
    });

    it('should throw error when reject fails with non-401 error', async () => {
      const errorResponse = { message: 'Request not found' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve(errorResponse)
      });

      await expect(TurnService.rejectModifyRequest(requestId, accessToken))
        .rejects.toThrow('Request not found');
    });

    it('should throw error when fetch fails during reject', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(TurnService.rejectModifyRequest(requestId, accessToken))
        .rejects.toThrow('Network error');
    });
  });
});