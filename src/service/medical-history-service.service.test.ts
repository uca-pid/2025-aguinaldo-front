import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MedicalHistoryService } from './medical-history-service.service';
import type { MedicalHistory, CreateMedicalHistoryRequest, UpdateMedicalHistoryContentRequest } from '../models/MedicalHistory';

// Mock the API config
vi.mock('../../config/api', () => ({
  API_CONFIG: {
    BASE_URL: 'http://localhost:8080',
    ENDPOINTS: {
      ADD_MEDICAL_HISTORY: '/api/doctors/{doctorId}/medical-history',
      UPDATE_MEDICAL_HISTORY_ENTRY: '/api/doctors/{doctorId}/medical-history/{historyId}',
      DELETE_MEDICAL_HISTORY: '/api/doctors/{doctorId}/medical-history/{historyId}',
      GET_PATIENT_MEDICAL_HISTORY: '/api/doctors/medical-history/patient/{patientId}'
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

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('MedicalHistoryService', () => {
  const accessToken = 'access-token-123';
  const doctorId = 'doctor-1';
  const patientId = 'patient-1';
  const historyId = 'history-1';

  const mockMedicalHistory: MedicalHistory = {
    id: 'history-1',
    content: 'Patient has allergies to penicillin and peanuts',
    patientId: 'patient-1',
    patientName: 'John',
    patientSurname: 'Doe',
    doctorId: 'doctor-1',
    doctorName: 'Dr. Jane',
    doctorSurname: 'Smith',
    createdAt: '2023-10-08T10:00:00Z',
    updatedAt: '2023-10-08T10:00:00Z',
    turnId: 'turn-1'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('addMedicalHistory', () => {
    const createRequest: CreateMedicalHistoryRequest = {
      turnId: 'turn-1',
      content: 'Patient has allergies to penicillin and peanuts'
    };

    it('should successfully add medical history', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockMedicalHistory)
      });

      const result = await MedicalHistoryService.addMedicalHistory(accessToken, doctorId, createRequest);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/doctors/doctor-1/medical-history',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(createRequest),
          headers: expect.objectContaining({
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          })
        })
      );
      expect(result).toEqual(mockMedicalHistory);
    });

    it('should throw error when add medical history fails with error message', async () => {
      const errorResponse = { message: 'Patient not found' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve(errorResponse)
      });

      await expect(MedicalHistoryService.addMedicalHistory(accessToken, doctorId, createRequest))
        .rejects.toThrow('Patient not found');
    });

    it('should throw error when add medical history fails with error field', async () => {
      const errorResponse = { error: 'Content cannot be empty' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve(errorResponse)
      });

      await expect(MedicalHistoryService.addMedicalHistory(accessToken, doctorId, createRequest))
        .rejects.toThrow('Content cannot be empty');
    });

    it('should throw error with default message when add fails without error details', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      await expect(MedicalHistoryService.addMedicalHistory(accessToken, doctorId, createRequest))
        .rejects.toThrow('Failed to add medical history! Status: 500');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network connection failed');
      mockFetch.mockRejectedValueOnce(networkError);

      await expect(MedicalHistoryService.addMedicalHistory(accessToken, doctorId, createRequest))
        .rejects.toThrow('Network connection failed');
    });
  });

  describe('updateMedicalHistory', () => {
    const updateRequest: UpdateMedicalHistoryContentRequest = {
      content: 'Updated medical history with new allergies'
    };

    it('should successfully update medical history', async () => {
      const updatedHistory = { ...mockMedicalHistory, content: updateRequest.content };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(updatedHistory)
      });

      const result = await MedicalHistoryService.updateMedicalHistory(accessToken, doctorId, historyId, updateRequest);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/doctors/doctor-1/medical-history/history-1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateRequest),
          headers: expect.objectContaining({
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          })
        })
      );
      expect(result).toEqual(updatedHistory);
    });

    it('should throw error when update medical history fails with error message', async () => {
      const errorResponse = { message: 'Medical history not found' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve(errorResponse)
      });

      await expect(MedicalHistoryService.updateMedicalHistory(accessToken, doctorId, historyId, updateRequest))
        .rejects.toThrow('Medical history not found');
    });

    it('should throw error when update medical history fails with error field', async () => {
      const errorResponse = { error: 'Unauthorized access' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: () => Promise.resolve(errorResponse)
      });

      await expect(MedicalHistoryService.updateMedicalHistory(accessToken, doctorId, historyId, updateRequest))
        .rejects.toThrow('Unauthorized access');
    });

    it('should throw error with default message when update fails without error details', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      await expect(MedicalHistoryService.updateMedicalHistory(accessToken, doctorId, historyId, updateRequest))
        .rejects.toThrow('Failed to update medical history! Status: 500');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network connection failed');
      mockFetch.mockRejectedValueOnce(networkError);

      await expect(MedicalHistoryService.updateMedicalHistory(accessToken, doctorId, historyId, updateRequest))
        .rejects.toThrow('Network connection failed');
    });
  });

  describe('deleteMedicalHistory', () => {
    it('should successfully delete medical history', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})
      });

      await expect(MedicalHistoryService.deleteMedicalHistory(accessToken, doctorId, historyId))
        .resolves.not.toThrow();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/doctors/doctor-1/medical-history/history-1',
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('should throw error when delete medical history fails with error message', async () => {
      const errorResponse = { message: 'Medical history not found' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve(errorResponse)
      });

      await expect(MedicalHistoryService.deleteMedicalHistory(accessToken, doctorId, historyId))
        .rejects.toThrow('Medical history not found');
    });

    it('should throw error when delete medical history fails with error field', async () => {
      const errorResponse = { error: 'Unauthorized access' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: () => Promise.resolve(errorResponse)
      });

      await expect(MedicalHistoryService.deleteMedicalHistory(accessToken, doctorId, historyId))
        .rejects.toThrow('Unauthorized access');
    });

    it('should throw error with default message when delete fails without error details', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      await expect(MedicalHistoryService.deleteMedicalHistory(accessToken, doctorId, historyId))
        .rejects.toThrow('Failed to delete medical history! Status: 500');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network connection failed');
      mockFetch.mockRejectedValueOnce(networkError);

      await expect(MedicalHistoryService.deleteMedicalHistory(accessToken, doctorId, historyId))
        .rejects.toThrow('Network connection failed');
    });
  });

  describe('getPatientMedicalHistory', () => {
    const mockHistories: MedicalHistory[] = [
      {
        id: 'history-1',
        content: 'Patient has allergies to penicillin',
        patientId: 'patient-1',
        patientName: 'John',
        patientSurname: 'Doe',
        doctorId: 'doctor-1',
        doctorName: 'Dr. Jane',
        doctorSurname: 'Smith',
        createdAt: '2023-10-08T10:00:00Z',
        updatedAt: '2023-10-08T10:00:00Z',
        turnId: 'turn-1'
      },
      {
        id: 'history-2',
        content: 'Patient underwent surgery',
        patientId: 'patient-1',
        patientName: 'John',
        patientSurname: 'Doe',
        doctorId: 'doctor-1',
        doctorName: 'Dr. Jane',
        doctorSurname: 'Smith',
        createdAt: '2023-10-07T09:00:00Z',
        updatedAt: '2023-10-07T09:00:00Z',
        turnId: 'turn-2'
      }
    ];

    it('should successfully get patient medical history', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockHistories)
      });

      const result = await MedicalHistoryService.getPatientMedicalHistory(accessToken, patientId);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/doctors/medical-history/patient/patient-1',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          })
        })
      );
      expect(result).toEqual(mockHistories);
    });

    it('should return empty array when patient has no medical history', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      });

      const result = await MedicalHistoryService.getPatientMedicalHistory(accessToken, patientId);

      expect(result).toEqual([]);
    });

    it('should throw error when get medical history fails with error message', async () => {
      const errorResponse = { message: 'Patient not found' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve(errorResponse)
      });

      await expect(MedicalHistoryService.getPatientMedicalHistory(accessToken, patientId))
        .rejects.toThrow('Patient not found');
    });

    it('should throw error when get medical history fails with error field', async () => {
      const errorResponse = { error: 'Unauthorized access' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: () => Promise.resolve(errorResponse)
      });

      await expect(MedicalHistoryService.getPatientMedicalHistory(accessToken, patientId))
        .rejects.toThrow('Unauthorized access');
    });

    it('should throw error with default message when get fails without error details', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      await expect(MedicalHistoryService.getPatientMedicalHistory(accessToken, patientId))
        .rejects.toThrow('Failed to get patient medical history! Status: 500');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network connection failed');
      mockFetch.mockRejectedValueOnce(networkError);

      await expect(MedicalHistoryService.getPatientMedicalHistory(accessToken, patientId))
        .rejects.toThrow('Network connection failed');
    });
  });
});