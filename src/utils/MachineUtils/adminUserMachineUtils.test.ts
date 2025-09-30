import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { approveDoctor, rejectDoctor } from './adminUserMachineUtils'
import { AdminService } from '../../service/admin-service.service'

// Mock the AdminService
vi.mock('../../service/admin-service.service', () => ({
  AdminService: {
    approveDoctor: vi.fn(),
    rejectDoctor: vi.fn()
  }
}))

describe('adminUserMachineUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('approveDoctor', () => {
    it('should call AdminService.approveDoctor with correct parameters', async () => {
      const params = {
        doctorId: 'doctor123',
        accessToken: 'token456'
      }
      const mockResponse = { success: true, message: 'Doctor approved' }
      ;(AdminService.approveDoctor as Mock).mockResolvedValue(mockResponse)

      const result = await approveDoctor(params)

      expect(AdminService.approveDoctor).toHaveBeenCalledWith('doctor123', 'token456')
      expect(result).toEqual(mockResponse)
    })

    it('should throw error when approval fails', async () => {
      const params = {
        doctorId: 'doctor123',
        accessToken: 'token456'
      }
      const error = new Error('Approval failed')
      ;(AdminService.approveDoctor as Mock).mockRejectedValue(error)

      await expect(approveDoctor(params)).rejects.toThrow('Approval failed')
    })
  })

  describe('rejectDoctor', () => {
    it('should call AdminService.rejectDoctor with correct parameters', async () => {
      const params = {
        doctorId: 'doctor123',
        accessToken: 'token456'
      }
      const mockResponse = { success: true, message: 'Doctor rejected' }
      ;(AdminService.rejectDoctor as Mock).mockResolvedValue(mockResponse)

      const result = await rejectDoctor(params)

      expect(AdminService.rejectDoctor).toHaveBeenCalledWith('doctor123', 'token456')
      expect(result).toEqual(mockResponse)
    })

    it('should throw error when rejection fails', async () => {
      const params = {
        doctorId: 'doctor123',
        accessToken: 'token456'
      }
      const error = new Error('Rejection failed')
      ;(AdminService.rejectDoctor as Mock).mockRejectedValue(error)

      await expect(rejectDoctor(params)).rejects.toThrow('Rejection failed')
    })
  })
})