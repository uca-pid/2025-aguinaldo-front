import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import {
  loadDoctorPatients,
  loadDoctorAvailability,
  updateMedicalHistory,
  saveDoctorAvailability
} from './doctorMachineUtils'
import { DoctorService } from '../../service/doctor-service.service'
import { MedicalHistoryService } from '../../service/medical-history-service.service'

// Mock the DoctorService
vi.mock('../../service/doctor-service.service', () => ({
  DoctorService: {
    getDoctorPatients: vi.fn(),
    getAvailability: vi.fn(),
    saveAvailability: vi.fn()
  }
}))

// Mock the MedicalHistoryService
vi.mock('../../service/medical-history-service.service', () => ({
  MedicalHistoryService: {
    addMedicalHistory: vi.fn(),
    updateMedicalHistory: vi.fn(),
    deleteMedicalHistory: vi.fn(),
    getPatientMedicalHistory: vi.fn(),
  }
}))

describe('doctorMachineUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loadDoctorPatients', () => {
    it('should call DoctorService.getDoctorPatients with correct parameters', async () => {
      const params = {
        accessToken: 'token123',
        doctorId: 'doctor456'
      }
      const mockPatients = [
        { id: 'pat1', name: 'John Doe' },
        { id: 'pat2', name: 'Jane Smith' }
      ]
      ;(DoctorService.getDoctorPatients as Mock).mockResolvedValue(mockPatients)

      const result = await loadDoctorPatients(params)

      expect(DoctorService.getDoctorPatients).toHaveBeenCalledWith('token123', 'doctor456')
      expect(result).toEqual(mockPatients)
    })
  })

  describe('loadDoctorAvailability', () => {
    it('should call DoctorService.getAvailability with correct parameters', async () => {
      const params = {
        accessToken: 'token123',
        doctorId: 'doctor456'
      }
      const mockAvailability = {
        weeklyAvailability: [
          { day: 'MONDAY', enabled: true, ranges: [{ start: '09:00', end: '17:00' }] }
        ]
      }
      ;(DoctorService.getAvailability as Mock).mockResolvedValue(mockAvailability)

      const result = await loadDoctorAvailability(params)

      expect(DoctorService.getAvailability).toHaveBeenCalledWith('token123', 'doctor456')
      expect(result).toEqual(mockAvailability)
    })
  })

  describe('updateMedicalHistory', () => {
    it('should call MedicalHistoryService.addMedicalHistory with correct parameters', async () => {
      const params = {
        accessToken: 'token123',
        doctorId: 'doctor456',
        patientId: 'patient789',
        medicalHistory: 'Patient has allergies to penicillin',
        turnId: 'turn-123'
      }

      const mockMedicalHistory = {
        id: 'history-1',
        content: 'Patient has allergies to penicillin',
        patientId: 'patient789',
        patientName: 'John',
        patientSurname: 'Doe',
        doctorId: 'doctor456',
        doctorName: 'Dr. Jane',
        doctorSurname: 'Smith',
        createdAt: '2023-10-08T10:00:00Z',
        updatedAt: '2023-10-08T10:00:00Z'
      };

      ;(MedicalHistoryService.getPatientMedicalHistory as Mock).mockResolvedValue([])
      ;(MedicalHistoryService.addMedicalHistory as Mock).mockResolvedValue(mockMedicalHistory)

      const result = await updateMedicalHistory(params)

      expect(MedicalHistoryService.addMedicalHistory).toHaveBeenCalledWith(
        'token123',
        'doctor456',
        {
          turnId: 'turn-123',
          content: 'Patient has allergies to penicillin'
        }
      )
      expect(result).toEqual(mockMedicalHistory)
    })
  })

  describe('saveDoctorAvailability', () => {
    it('should save availability with Spanish day names converted to English', async () => {
      const params = {
        accessToken: 'token123',
        doctorId: 'doctor456',
        slotDurationMin: 30,
        availability: [
          {
            day: 'LUNES',
            enabled: true,
            ranges: [{ start: '09:00', end: '17:00' }]
          },
          {
            day: 'MARTES',
            enabled: false,
            ranges: []
          }
        ]
      }

      ;(DoctorService.saveAvailability as Mock).mockResolvedValue(undefined)

      const result = await saveDoctorAvailability(params)

      expect(DoctorService.saveAvailability).toHaveBeenCalledWith('token123', 'doctor456', {
        weeklyAvailability: [
          {
            day: 'MONDAY',
            enabled: true,
            ranges: [{ start: '09:00', end: '17:00' }]
          },
          {
            day: 'TUESDAY',
            enabled: false,
            ranges: []
          }
        ]
      })
      expect(result).toBe('Availability saved successfully')
    })

    it('should handle MIÉRCOLES with accent', async () => {
      const params = {
        accessToken: 'token123',
        doctorId: 'doctor456',
        slotDurationMin: 30,
        availability: [
          {
            day: 'MIÉRCOLES',
            enabled: true,
            ranges: [{ start: '09:00', end: '17:00' }]
          }
        ]
      }

      ;(DoctorService.saveAvailability as Mock).mockResolvedValue(undefined)

      await saveDoctorAvailability(params)

      expect(DoctorService.saveAvailability).toHaveBeenCalledWith('token123', 'doctor456', {
        weeklyAvailability: [
          {
            day: 'WEDNESDAY',
            enabled: true,
            ranges: [{ start: '09:00', end: '17:00' }]
          }
        ]
      })
    })

    it('should filter out invalid time ranges', async () => {
      const params = {
        accessToken: 'token123',
        doctorId: 'doctor456',
        slotDurationMin: 30,
        availability: [
          {
            day: 'LUNES',
            enabled: true,
            ranges: [
              { start: '09:00', end: '17:00' }, // valid
              { start: 'invalid', end: '17:00' }, // invalid start
              { start: '09:00', end: 'invalid' }, // invalid end
              { start: '', end: '17:00' }, // empty start
              { start: '09:00', end: '' } // empty end
            ]
          }
        ]
      }

      ;(DoctorService.saveAvailability as Mock).mockResolvedValue(undefined)

      await saveDoctorAvailability(params)

      expect(DoctorService.saveAvailability).toHaveBeenCalledWith('token123', 'doctor456', {
        weeklyAvailability: [
          {
            day: 'MONDAY',
            enabled: true,
            ranges: [{ start: '09:00', end: '17:00' }]
          }
        ]
      })
    })

    it('should handle unknown day names', async () => {
      const params = {
        accessToken: 'token123',
        doctorId: 'doctor456',
        slotDurationMin: 30,
        availability: [
          {
            day: 'UNKNOWN_DAY',
            enabled: true,
            ranges: [{ start: '09:00', end: '17:00' }]
          }
        ]
      }

      ;(DoctorService.saveAvailability as Mock).mockResolvedValue(undefined)

      await saveDoctorAvailability(params)

      expect(DoctorService.saveAvailability).toHaveBeenCalledWith('token123', 'doctor456', {
        weeklyAvailability: [
          {
            day: 'UNKNOWN_DAY',
            enabled: true,
            ranges: [{ start: '09:00', end: '17:00' }]
          }
        ]
      })
    })
  })
})