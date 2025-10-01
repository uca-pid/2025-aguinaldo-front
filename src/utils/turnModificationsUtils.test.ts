import { describe, it, expect, vi, beforeEach } from 'vitest'
import { approveModifyRequest, rejectModifyRequest } from './turnModificationsUtils'

// Mock dependencies
vi.mock('../service/turn-service.service', () => ({
  TurnService: {
    approveModifyRequest: vi.fn(),
    rejectModifyRequest: vi.fn()
  }
}))

vi.mock('#/core/Orchestrator', () => ({
  orchestrator: {
    send: vi.fn()
  }
}))

describe('turnModificationsUtils', () => {
  const mockRequestId = 'request-123'
  const mockAccessToken = 'token-456'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('approveModifyRequest', () => {
    it('should return early if no access token provided', async () => {
      await approveModifyRequest(mockRequestId, '')

      // Should not call any orchestrator methods or service
      expect(vi.mocked(await import('#/core/Orchestrator')).orchestrator.send).not.toHaveBeenCalled()
      expect(vi.mocked(await import('../service/turn-service.service')).TurnService.approveModifyRequest).not.toHaveBeenCalled()
    })

    it('should return early if access token is undefined', async () => {
      await approveModifyRequest(mockRequestId, undefined as any)

      expect(vi.mocked(await import('#/core/Orchestrator')).orchestrator.send).not.toHaveBeenCalled()
      expect(vi.mocked(await import('../service/turn-service.service')).TurnService.approveModifyRequest).not.toHaveBeenCalled()
    })

    it('should successfully approve modify request', async () => {
      const { TurnService } = await import('../service/turn-service.service')
      const { orchestrator } = await import('#/core/Orchestrator')

      vi.mocked(TurnService.approveModifyRequest).mockResolvedValueOnce(undefined)

      await approveModifyRequest(mockRequestId, mockAccessToken)

      // Should toggle loading on
      expect(orchestrator.send).toHaveBeenNthCalledWith(1, { type: "TOGGLE", key: "loadingApprove" })

      // Should call service with correct parameters
      expect(TurnService.approveModifyRequest).toHaveBeenCalledWith(mockRequestId, mockAccessToken)

      // Should load doctor modify requests
      expect(orchestrator.send).toHaveBeenNthCalledWith(2, { type: "LOAD_DOCTOR_MODIFY_REQUESTS" })

      // Should show success snackbar
      expect(orchestrator.send).toHaveBeenNthCalledWith(3, {
        type: "OPEN_SNACKBAR",
        message: "Solicitud aprobada correctamente",
        severity: "success"
      })

      // Should toggle loading off
      expect(orchestrator.send).toHaveBeenNthCalledWith(4, { type: "TOGGLE", key: "loadingApprove" })
    })

    it('should handle service error and show error snackbar', async () => {
      const { TurnService } = await import('../service/turn-service.service')
      const { orchestrator } = await import('#/core/Orchestrator')

      const mockError = new Error('Service error')
      vi.mocked(TurnService.approveModifyRequest).mockRejectedValueOnce(mockError)

      await approveModifyRequest(mockRequestId, mockAccessToken)

      // Should toggle loading on
      expect(orchestrator.send).toHaveBeenNthCalledWith(1, { type: "TOGGLE", key: "loadingApprove" })

      // Should call service
      expect(TurnService.approveModifyRequest).toHaveBeenCalledWith(mockRequestId, mockAccessToken)

      // Should show error snackbar
      expect(orchestrator.send).toHaveBeenNthCalledWith(2, {
        type: "OPEN_SNACKBAR",
        message: "Error al aprobar la solicitud",
        severity: "error"
      })

      // Should toggle loading off in finally
      expect(orchestrator.send).toHaveBeenNthCalledWith(3, { type: "TOGGLE", key: "loadingApprove" })

      // Should not load doctor modify requests on error
      expect(orchestrator.send).not.toHaveBeenCalledWith({ type: "LOAD_DOCTOR_MODIFY_REQUESTS" })
    })

    it('should toggle loading off even if service throws error', async () => {
      const { TurnService } = await import('../service/turn-service.service')
      const { orchestrator } = await import('#/core/Orchestrator')

      vi.mocked(TurnService.approveModifyRequest).mockRejectedValueOnce(new Error('Network error'))

      await expect(approveModifyRequest(mockRequestId, mockAccessToken)).resolves.toBeUndefined()

      // Should have called toggle loading twice (on and off)
      const toggleCalls = vi.mocked(orchestrator.send).mock.calls.filter(
        call => call[0].type === "TOGGLE" && call[0].key === "loadingApprove"
      )
      expect(toggleCalls).toHaveLength(2)
    })
  })

  describe('rejectModifyRequest', () => {
    it('should return early if no access token provided', async () => {
      await rejectModifyRequest(mockRequestId, '')

      expect(vi.mocked(await import('#/core/Orchestrator')).orchestrator.send).not.toHaveBeenCalled()
      expect(vi.mocked(await import('../service/turn-service.service')).TurnService.rejectModifyRequest).not.toHaveBeenCalled()
    })

    it('should return early if access token is undefined', async () => {
      await rejectModifyRequest(mockRequestId, undefined as any)

      expect(vi.mocked(await import('#/core/Orchestrator')).orchestrator.send).not.toHaveBeenCalled()
      expect(vi.mocked(await import('../service/turn-service.service')).TurnService.rejectModifyRequest).not.toHaveBeenCalled()
    })

    it('should successfully reject modify request', async () => {
      const { TurnService } = await import('../service/turn-service.service')
      const { orchestrator } = await import('#/core/Orchestrator')

      vi.mocked(TurnService.rejectModifyRequest).mockResolvedValueOnce(undefined)

      await rejectModifyRequest(mockRequestId, mockAccessToken)

      // Should toggle loading on
      expect(orchestrator.send).toHaveBeenNthCalledWith(1, { type: "TOGGLE", key: "loadingReject" })

      // Should call service with correct parameters
      expect(TurnService.rejectModifyRequest).toHaveBeenCalledWith(mockRequestId, mockAccessToken)

      // Should load doctor modify requests
      expect(orchestrator.send).toHaveBeenNthCalledWith(2, { type: "LOAD_DOCTOR_MODIFY_REQUESTS" })

      // Should show success snackbar
      expect(orchestrator.send).toHaveBeenNthCalledWith(3, {
        type: "OPEN_SNACKBAR",
        message: "Solicitud rechazada correctamente",
        severity: "success"
      })

      // Should toggle loading off
      expect(orchestrator.send).toHaveBeenNthCalledWith(4, { type: "TOGGLE", key: "loadingReject" })
    })

    it('should handle service error and show error snackbar', async () => {
      const { TurnService } = await import('../service/turn-service.service')
      const { orchestrator } = await import('#/core/Orchestrator')

      const mockError = new Error('Service error')
      vi.mocked(TurnService.rejectModifyRequest).mockRejectedValueOnce(mockError)

      await rejectModifyRequest(mockRequestId, mockAccessToken)

      // Should toggle loading on
      expect(orchestrator.send).toHaveBeenNthCalledWith(1, { type: "TOGGLE", key: "loadingReject" })

      // Should call service
      expect(TurnService.rejectModifyRequest).toHaveBeenCalledWith(mockRequestId, mockAccessToken)

      // Should show error snackbar
      expect(orchestrator.send).toHaveBeenNthCalledWith(2, {
        type: "OPEN_SNACKBAR",
        message: "Error al rechazar la solicitud",
        severity: "error"
      })

      // Should toggle loading off in finally
      expect(orchestrator.send).toHaveBeenNthCalledWith(3, { type: "TOGGLE", key: "loadingReject" })

      // Should not load doctor modify requests on error
      expect(orchestrator.send).not.toHaveBeenCalledWith({ type: "LOAD_DOCTOR_MODIFY_REQUESTS" })
    })

    it('should toggle loading off even if service throws error', async () => {
      const { TurnService } = await import('../service/turn-service.service')
      const { orchestrator } = await import('#/core/Orchestrator')

      vi.mocked(TurnService.rejectModifyRequest).mockRejectedValueOnce(new Error('Network error'))

      await expect(rejectModifyRequest(mockRequestId, mockAccessToken)).resolves.toBeUndefined()

      // Should have called toggle loading twice (on and off)
      const toggleCalls = vi.mocked(orchestrator.send).mock.calls.filter(
        call => call[0].type === "TOGGLE" && call[0].key === "loadingReject"
      )
      expect(toggleCalls).toHaveLength(2)
    })
  })
})