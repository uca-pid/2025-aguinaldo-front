import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import {
  createTurn,
  cancelTurn,
  createModifyTurnRequest,
  loadTurnDetails,
  loadDoctorAvailability,
  loadAvailableSlots
} from './turnMachineUtils'
import { TurnService } from '../../service/turn-service.service'

// Mock fetch globally
global.fetch = vi.fn()

// Mock the TurnService
vi.mock('../../service/turn-service.service', () => ({
  TurnService: {
    createTurn: vi.fn(),
    createModifyRequest: vi.fn(),
    getDoctorAvailability: vi.fn(),
    getAvailableTurns: vi.fn(),
    getMyTurns: vi.fn(),
    getDoctorModifyRequests: vi.fn()
  }
}))

// Mock AuthService for token refresh
vi.mock('../../service/auth-service.service', () => ({
  AuthService: {
    refreshToken: vi.fn()
  }
}))

describe('turnMachineUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(global.fetch as Mock).mockClear()
  })

  describe('createTurn', () => {
    it('should call TurnService.createTurn with correct parameters', async () => {
      const params = {
        accessToken: 'token123',
        userId: 'user456',
        doctorId: 'doctor789',
        scheduledAt: '2024-01-01T10:00:00Z'
      }
      const mockResponse = { id: 'turn123', status: 'CONFIRMED' }
      ;(TurnService.createTurn as Mock).mockResolvedValue(mockResponse)

      const result = await createTurn(params)

      expect(TurnService.createTurn).toHaveBeenCalledWith(
        {
          doctorId: 'doctor789',
          patientId: 'user456',
          scheduledAt: '2024-01-01T10:00:00Z'
        },
        'token123'
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('cancelTurn', () => {
    it('should successfully cancel turn', async () => {
      const params = {
        accessToken: 'token123',
        turnId: 'turn456'
      }
      ;(global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({})
      })

      await expect(cancelTurn(params)).resolves.not.toThrow()

      expect(global.fetch).toHaveBeenCalledWith('/api/turns/turn456/cancel', {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer token123',
          'Content-Type': 'application/json'
        }
      })
    })

    it('should throw error when cancel fails', async () => {
      const params = {
        accessToken: 'token123',
        turnId: 'turn456'
      }
      ;(global.fetch as Mock).mockResolvedValue({
        ok: false,
        text: vi.fn().mockResolvedValue('Cancel failed')
      })

      await expect(cancelTurn(params)).rejects.toThrow('Failed to cancel turn: Cancel failed')
    })
  })

  describe('createModifyTurnRequest', () => {
    it('should call TurnService.createModifyRequest with correct parameters', async () => {
      const params = {
        accessToken: 'token123',
        turnId: 'turn456',
        newScheduledAt: '2024-01-02T11:00:00Z'
      }
      const mockResponse = { id: 'request123', status: 'PENDING' }
      ;(TurnService.createModifyRequest as Mock).mockResolvedValue(mockResponse)

      const result = await createModifyTurnRequest(params)

      expect(TurnService.createModifyRequest).toHaveBeenCalledWith({
        turnId: 'turn456',
        newScheduledAt: '2024-01-02T11:00:00Z'
      }, 'token123')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('loadTurnDetails', () => {
    it('should return turn details when found', async () => {
      const params = {
        turnId: 'turn456',
        accessToken: 'token123'
      }
      const mockTurns = [
        { id: 'turn123', status: 'CONFIRMED' },
        { id: 'turn456', status: 'PENDING' }
      ]
      ;(global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockTurns)
      })

      const result = await loadTurnDetails(params)

      expect(result).toEqual({ id: 'turn456', status: 'PENDING' })
      expect(global.fetch).toHaveBeenCalledWith('/api/turns/my-turns', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer token123',
          'Content-Type': 'application/json'
        }
      })
    })

    it('should throw error when turn not found', async () => {
      const params = {
        turnId: 'turn999',
        accessToken: 'token123'
      }
      const mockTurns = [
        { id: 'turn123', status: 'CONFIRMED' },
        { id: 'turn456', status: 'PENDING' }
      ]
      ;(global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockTurns)
      })

      await expect(loadTurnDetails(params)).rejects.toThrow('Turn with ID turn999 not found in your turns')
    })

    it('should refresh token and retry on 401', async () => {
      const params = {
        turnId: 'turn456',
        accessToken: 'old-token'
      }
      const mockTurns = [{ id: 'turn456', status: 'PENDING' }]

      // Mock localStorage
      const localStorageMock = {
        getItem: vi.fn().mockReturnValue(JSON.stringify({ refreshToken: 'refresh-token' })),
        setItem: vi.fn()
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })

      // First call returns 401, second call succeeds
      ;(global.fetch as Mock)
        .mockResolvedValueOnce({
          status: 401,
          ok: false
        })
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(mockTurns)
        })

      // Mock AuthService.refreshToken
      const { AuthService } = await import('../../service/auth-service.service')
      ;(AuthService.refreshToken as Mock).mockResolvedValue({
        accessToken: 'new-token',
        refreshToken: 'new-refresh'
      })

      const result = await loadTurnDetails(params)

      expect(AuthService.refreshToken).toHaveBeenCalledWith('refresh-token')
      expect(localStorage.setItem).toHaveBeenCalledWith('authData', JSON.stringify({
        accessToken: 'new-token',
        refreshToken: 'new-refresh'
      }))
      expect(result).toEqual({ id: 'turn456', status: 'PENDING' })
    })

    it('should throw error on API failure', async () => {
      const params = {
        turnId: 'turn456',
        accessToken: 'token123'
      }
      ;(global.fetch as Mock).mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error',
        text: vi.fn().mockResolvedValue('Server error')
      })

      await expect(loadTurnDetails(params)).rejects.toThrow('Failed to load my turns: Internal Server Error - Server error')
    })
  })

  describe('loadDoctorAvailability', () => {
    it('should return available dates from TurnService', async () => {
      const params = {
        accessToken: 'token123',
        doctorId: 'doctor456'
      }
      const mockAvailability = {
        availableDates: ['2024-01-01', '2024-01-02']
      }
      ;(TurnService.getDoctorAvailability as Mock).mockResolvedValue(mockAvailability)

      const result = await loadDoctorAvailability(params)

      expect(TurnService.getDoctorAvailability).toHaveBeenCalledWith('doctor456', 'token123')
      expect(result).toEqual(['2024-01-01', '2024-01-02'])
    })

    it('should return empty array when no availability', async () => {
      const params = {
        accessToken: 'token123',
        doctorId: 'doctor456'
      }
      ;(TurnService.getDoctorAvailability as Mock).mockResolvedValue(null)

      const result = await loadDoctorAvailability(params)

      expect(result).toEqual([])
    })
  })

  describe('loadAvailableSlots', () => {
    it('should return available slots from TurnService', async () => {
      const params = {
        accessToken: 'token123',
        doctorId: 'doctor456',
        date: '2024-01-01'
      }
      const mockSlots = ['10:00', '11:00', '14:00']
      ;(TurnService.getAvailableTurns as Mock).mockResolvedValue(mockSlots)

      const result = await loadAvailableSlots(params)

      expect(TurnService.getAvailableTurns).toHaveBeenCalledWith('doctor456', '2024-01-01', 'token123')
      expect(result).toEqual(['10:00', '11:00', '14:00'])
    })

    it('should return empty array when no slots available', async () => {
      const params = {
        accessToken: 'token123',
        doctorId: 'doctor456',
        date: '2024-01-01'
      }
      ;(TurnService.getAvailableTurns as Mock).mockResolvedValue(null)

      const result = await loadAvailableSlots(params)

      expect(result).toEqual([])
    })
  })
})