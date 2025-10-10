import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addMedicalHistory, loadTurnMedicalHistory } from './doctorMachineUtils';
import { MedicalHistoryService } from '../../service/medical-history-service.service';

// Mock the MedicalHistoryService
vi.mock('../../service/medical-history-service.service', () => ({
  MedicalHistoryService: {
    addMedicalHistory: vi.fn(),
    getPatientMedicalHistory: vi.fn(),
  },
}));

describe('doctorMachineUtils - Turn-based Medical History', () => {
  const mockAccessToken = 'mock-token';
  const mockDoctorId = 'doctor-123';
  const mockTurnId = 'turn-456';
  const mockPatientId = 'patient-789';
  const mockContent = 'Patient showed improvement';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addMedicalHistory', () => {
    it('should call MedicalHistoryService.addMedicalHistory with turnId', async () => {
      const mockResponse = {
        id: 'history-123',
        content: mockContent,
        turnId: mockTurnId,
        patientId: mockPatientId,
        createdAt: '2025-01-01T10:00:00Z',
        updatedAt: '2025-01-01T10:00:00Z',
        patientName: 'John',
        patientSurname: 'Doe',
        doctorId: mockDoctorId,
        doctorName: 'Dr. Smith',
        doctorSurname: 'Johnson'
      };

      vi.mocked(MedicalHistoryService.addMedicalHistory).mockResolvedValue(mockResponse);

      const result = await addMedicalHistory({
        accessToken: mockAccessToken,
        doctorId: mockDoctorId,
        turnId: mockTurnId,
        content: mockContent
      });

      expect(MedicalHistoryService.addMedicalHistory).toHaveBeenCalledWith(
        mockAccessToken,
        mockDoctorId,
        {
          turnId: mockTurnId,
          content: mockContent
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('loadTurnMedicalHistory', () => {
    it('should filter medical history by turnId', async () => {
      const allHistory = [
        {
          id: 'history-1',
          content: 'First entry',
          turnId: mockTurnId,
          patientId: mockPatientId,
          createdAt: '2025-01-01T10:00:00Z',
          updatedAt: '2025-01-01T10:00:00Z',
          patientName: 'John',
          patientSurname: 'Doe',
          doctorId: mockDoctorId,
          doctorName: 'Dr. Smith',
          doctorSurname: 'Johnson'
        },
        {
          id: 'history-2',
          content: 'Second entry',
          turnId: 'different-turn-id',
          patientId: mockPatientId,
          createdAt: '2025-01-02T10:00:00Z',
          updatedAt: '2025-01-02T10:00:00Z',
          patientName: 'John',
          patientSurname: 'Doe',
          doctorId: mockDoctorId,
          doctorName: 'Dr. Smith',
          doctorSurname: 'Johnson'
        },
        {
          id: 'history-3',
          content: 'Third entry',
          turnId: mockTurnId,
          patientId: mockPatientId,
          createdAt: '2025-01-03T10:00:00Z',
          updatedAt: '2025-01-03T10:00:00Z',
          patientName: 'John',
          patientSurname: 'Doe',
          doctorId: mockDoctorId,
          doctorName: 'Dr. Smith',
          doctorSurname: 'Johnson'
        }
      ];

      vi.mocked(MedicalHistoryService.getPatientMedicalHistory).mockResolvedValue(allHistory);

      const result = await loadTurnMedicalHistory({
        accessToken: mockAccessToken,
        turnId: mockTurnId,
        patientId: mockPatientId
      });

      expect(MedicalHistoryService.getPatientMedicalHistory).toHaveBeenCalledWith(
        mockAccessToken,
        mockPatientId
      );
      
      // Should only return entries for the specific turn
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('history-1');
      expect(result[1].id).toBe('history-3');
      expect(result.every(h => h.turnId === mockTurnId)).toBe(true);
    });

    it('should return empty array when no history matches turnId', async () => {
      const allHistory = [
        {
          id: 'history-1',
          content: 'Entry for different turn',
          turnId: 'different-turn-id',
          patientId: mockPatientId,
          createdAt: '2025-01-01T10:00:00Z',
          updatedAt: '2025-01-01T10:00:00Z',
          patientName: 'John',
          patientSurname: 'Doe',
          doctorId: mockDoctorId,
          doctorName: 'Dr. Smith',
          doctorSurname: 'Johnson'
        }
      ];

      vi.mocked(MedicalHistoryService.getPatientMedicalHistory).mockResolvedValue(allHistory);

      const result = await loadTurnMedicalHistory({
        accessToken: mockAccessToken,
        turnId: mockTurnId,
        patientId: mockPatientId
      });

      expect(result).toHaveLength(0);
    });
  });
});