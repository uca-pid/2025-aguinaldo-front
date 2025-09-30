import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import {
  loadDoctors,
  loadPendingDoctors,
  loadAdminStats,
  loadAvailableTurns,
  loadMyTurns,
  loadDoctorModifyRequests
} from './dataMachineUtils'
import { AdminService } from '../../service/admin-service.service'
import { TurnService } from '../../service/turn-service.service'

// Mock the services
vi.mock('../../service/admin-service.service', () => ({
  AdminService: {
    getPendingDoctors: vi.fn(),
    getAdminStats: vi.fn()
  }
}))

vi.mock('../../service/turn-service.service', () => ({
  TurnService: {
    getDoctors: vi.fn(),
    getAvailableTurns: vi.fn(),
    getMyTurns: vi.fn(),
    getDoctorModifyRequests: vi.fn()
  }
}))

describe('dataMachineUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loadDoctors', () => {
    it('should call TurnService.getDoctors with correct parameters', async () => {
      const params = { accessToken: 'token123' }
      const mockDoctors = [
        { id: 'doc1', name: 'Dr. Smith' },
        { id: 'doc2', name: 'Dr. Johnson' }
      ]
      ;(TurnService.getDoctors as Mock).mockResolvedValue(mockDoctors)

      const result = await loadDoctors(params)

      expect(TurnService.getDoctors).toHaveBeenCalledWith('token123')
      expect(result).toEqual(mockDoctors)
    })
  })

  describe('loadPendingDoctors', () => {
    it('should return pending doctors when user is admin', async () => {
      const params = { accessToken: 'token123', isAdmin: true }
      const mockPendingDoctors = [
        { id: 'doc1', name: 'Dr. Smith', status: 'PENDING' }
      ]
      ;(AdminService.getPendingDoctors as Mock).mockResolvedValue(mockPendingDoctors)

      const result = await loadPendingDoctors(params)

      expect(AdminService.getPendingDoctors).toHaveBeenCalledWith('token123')
      expect(result).toEqual(mockPendingDoctors)
    })

    it('should return empty array when user is not admin', async () => {
      const params = { accessToken: 'token123', isAdmin: false }

      const result = await loadPendingDoctors(params)

      expect(AdminService.getPendingDoctors).not.toHaveBeenCalled()
      expect(result).toEqual([])
    })
  })

  describe('loadAdminStats', () => {
    it('should return admin stats when user is admin', async () => {
      const params = { accessToken: 'token123', isAdmin: true }
      const mockStats = { patients: 100, doctors: 20, pending: 5 }
      ;(AdminService.getAdminStats as Mock).mockResolvedValue(mockStats)

      const result = await loadAdminStats(params)

      expect(AdminService.getAdminStats).toHaveBeenCalledWith('token123')
      expect(result).toEqual(mockStats)
    })

    it('should return default stats when user is not admin', async () => {
      const params = { accessToken: 'token123', isAdmin: false }

      const result = await loadAdminStats(params)

      expect(AdminService.getAdminStats).not.toHaveBeenCalled()
      expect(result).toEqual({ patients: 0, doctors: 0, pending: 0 })
    })
  })

  describe('loadAvailableTurns', () => {
    it('should call TurnService.getAvailableTurns with correct parameters', async () => {
      const params = {
        accessToken: 'token123',
        doctorId: 'doctor456',
        date: '2024-01-01'
      }
      const mockSlots = ['10:00', '11:00', '14:00']
      ;(TurnService.getAvailableTurns as Mock).mockResolvedValue(mockSlots)

      const result = await loadAvailableTurns(params)

      expect(TurnService.getAvailableTurns).toHaveBeenCalledWith('doctor456', '2024-01-01', 'token123')
      expect(result).toEqual(['10:00', '11:00', '14:00'])
    })
  })

  describe('loadMyTurns', () => {
    it('should call TurnService.getMyTurns with status', async () => {
      const params = { accessToken: 'token123', status: 'CONFIRMED' }
      const mockTurns = [
        { id: 'turn1', status: 'CONFIRMED' },
        { id: 'turn2', status: 'CONFIRMED' }
      ]
      ;(TurnService.getMyTurns as Mock).mockResolvedValue(mockTurns)

      const result = await loadMyTurns(params)

      expect(TurnService.getMyTurns).toHaveBeenCalledWith('token123', 'CONFIRMED')
      expect(result).toEqual(mockTurns)
    })

    it('should call TurnService.getMyTurns without status', async () => {
      const params = { accessToken: 'token123' }
      const mockTurns = [
        { id: 'turn1', status: 'CONFIRMED' },
        { id: 'turn2', status: 'PENDING' }
      ]
      ;(TurnService.getMyTurns as Mock).mockResolvedValue(mockTurns)

      const result = await loadMyTurns(params)

      expect(TurnService.getMyTurns).toHaveBeenCalledWith('token123', undefined)
      expect(result).toEqual(mockTurns)
    })
  })

  describe('loadDoctorModifyRequests', () => {
    it('should return modify requests when doctorId is provided', async () => {
      const params = { accessToken: 'token123', doctorId: 'doctor456' }
      const mockRequests = [
        { id: 'req1', status: 'PENDING' },
        { id: 'req2', status: 'APPROVED' }
      ]
      ;(TurnService.getDoctorModifyRequests as Mock).mockResolvedValue(mockRequests)

      const result = await loadDoctorModifyRequests(params)

      expect(TurnService.getDoctorModifyRequests).toHaveBeenCalledWith('doctor456', 'token123')
      expect(result).toEqual(mockRequests)
    })

    it('should return empty array when doctorId is not provided', async () => {
      const params = { accessToken: 'token123', doctorId: '' }

      const result = await loadDoctorModifyRequests(params)

      expect(TurnService.getDoctorModifyRequests).not.toHaveBeenCalled()
      expect(result).toEqual([])
    })

    it('should return empty array when doctorId is undefined', async () => {
      const params = { accessToken: 'token123', doctorId: undefined as any }

      const result = await loadDoctorModifyRequests(params)

      expect(TurnService.getDoctorModifyRequests).not.toHaveBeenCalled()
      expect(result).toEqual([])
    })
  })
})