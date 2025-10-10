import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createActor } from 'xstate';

// Mock all utilities and dependencies BEFORE importing the machine
vi.mock('../service/storage-service.service', () => ({
  StorageService: {
    uploadTurnFile: vi.fn(),
    deleteTurnFile: vi.fn(),
  }
}));

vi.mock('#/core/Orchestrator', () => ({
  orchestrator: {
    send: vi.fn(),
    sendToMachine: vi.fn(),
    registerMachine: vi.fn(),
  }
}));

import { filesMachine, FilesMachineDefaultContext } from './filesMachine';
import { orchestrator } from '#/core/Orchestrator';
import { StorageService } from '../service/storage-service.service';

describe('filesMachine', () => {
  let actor: any;
  let mockOrchestrator: any;
  let mockUploadTurnFile: any;
  let mockDeleteTurnFile: any;

  beforeEach(() => {
    vi.useFakeTimers();

    // Get mocked modules
    mockOrchestrator = vi.mocked(orchestrator);
    mockUploadTurnFile = vi.mocked(StorageService.uploadTurnFile);
    mockDeleteTurnFile = vi.mocked(StorageService.deleteTurnFile);

    // Reset all mocks
    vi.clearAllMocks();

    // Default successful responses
    mockUploadTurnFile.mockResolvedValue({
      url: 'https://example.com/file.pdf',
      fileName: 'test-file.pdf'
    });
    mockDeleteTurnFile.mockResolvedValue(undefined);
  });

  afterEach(() => {
    if (actor) {
      actor.stop();
    }
    vi.useRealTimers();
  });

  describe('Initial State', () => {
    it('should start in idle state with default context', () => {
      actor = createActor(filesMachine, {});
      actor.start();

      expect(actor.getSnapshot().value).toBe('idle');
      expect(actor.getSnapshot().context).toEqual(FilesMachineDefaultContext);
    });

    it('should have null authentication initially', () => {
      actor = createActor(filesMachine, {});
      actor.start();

      const context = actor.getSnapshot().context;
      expect(context.accessToken).toBeNull();
    });

    it('should have all loading flags set to false initially', () => {
      actor = createActor(filesMachine, {});
      actor.start();

      const context = actor.getSnapshot().context;
      expect(context.isUploadingFile).toBe(false);
      expect(context.isDeletingFile).toBe(false);
    });

    it('should have all error and success values set to null initially', () => {
      actor = createActor(filesMachine, {});
      actor.start();

      const context = actor.getSnapshot().context;
      expect(context.uploadError).toBeNull();
      expect(context.uploadSuccess).toBeNull();
      expect(context.deleteError).toBeNull();
      expect(context.deleteSuccess).toBeNull();
    });
  });

  describe('SET_AUTH Event', () => {
    it('should set access token in context', () => {
      actor = createActor(filesMachine, {});
      actor.start();

      actor.send({ type: 'SET_AUTH', accessToken: 'test-token' });

      expect(actor.getSnapshot().context.accessToken).toBe('test-token');
    });
  });

  describe('UPLOAD_TURN_FILE Event', () => {
    it('should not transition if no access token', () => {
      actor = createActor(filesMachine, {});
      actor.start();

      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      actor.send({ type: 'UPLOAD_TURN_FILE', turnId: 'turn-1', file: mockFile });

      expect(actor.getSnapshot().value).toBe('idle');
    });

    it('should transition to uploadingFile state when access token exists', () => {
      actor = createActor(filesMachine, {});
      actor.start();
      actor.send({ type: 'SET_AUTH', accessToken: 'test-token' });

      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      actor.send({ type: 'UPLOAD_TURN_FILE', turnId: 'turn-1', file: mockFile });

      expect(actor.getSnapshot().value).toBe('uploadingFile');
      expect(actor.getSnapshot().context.isUploadingFile).toBe(true);
      expect(actor.getSnapshot().context.uploadingFileTurnId).toBe('turn-1');
    });

    it('should call StorageService.uploadTurnFile with correct parameters', async () => {
      actor = createActor(filesMachine, {});
      actor.start();
      actor.send({ type: 'SET_AUTH', accessToken: 'test-token' });

      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      actor.send({ type: 'UPLOAD_TURN_FILE', turnId: 'turn-1', file: mockFile });

      await vi.runAllTimersAsync();

      expect(mockUploadTurnFile).toHaveBeenCalledWith('test-token', 'turn-1', mockFile);
    });

    it('should update data machine and show success snackbar on successful upload', async () => {
      actor = createActor(filesMachine, {});
      actor.start();
      actor.send({ type: 'SET_AUTH', accessToken: 'test-token' });

      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      actor.send({ type: 'UPLOAD_TURN_FILE', turnId: 'turn-1', file: mockFile });

      await vi.runAllTimersAsync();

      expect(mockOrchestrator.sendToMachine).toHaveBeenCalledWith('data', {
        type: 'UPDATE_TURN_FILE',
        turnId: 'turn-1',
        fileInfo: {
          url: 'https://example.com/file.pdf',
          fileName: 'test-file.pdf',
          uploadedAt: expect.any(String)
        }
      });

      expect(mockOrchestrator.sendToMachine).toHaveBeenCalledWith('ui', {
        type: 'OPEN_SNACKBAR',
        message: 'Archivo subido exitosamente',
        severity: 'success'
      });

      expect(actor.getSnapshot().value).toBe('idle');
      expect(actor.getSnapshot().context.isUploadingFile).toBe(false);
      expect(actor.getSnapshot().context.uploadSuccess).toBe('Archivo subido exitosamente');
    });

    it('should handle upload error and show error snackbar', async () => {
      mockUploadTurnFile.mockRejectedValueOnce(new Error('Upload failed'));

      actor = createActor(filesMachine, {});
      actor.start();
      actor.send({ type: 'SET_AUTH', accessToken: 'test-token' });

      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      actor.send({ type: 'UPLOAD_TURN_FILE', turnId: 'turn-1', file: mockFile });

      await vi.runAllTimersAsync();

      expect(mockOrchestrator.sendToMachine).toHaveBeenCalledWith('ui', {
        type: 'OPEN_SNACKBAR',
        message: 'Upload failed',
        severity: 'error'
      });

      expect(actor.getSnapshot().value).toBe('idle');
      expect(actor.getSnapshot().context.isUploadingFile).toBe(false);
      expect(actor.getSnapshot().context.uploadError).toBe('Upload failed');
    });
  });

  describe('DELETE_TURN_FILE Event', () => {
    it('should not transition if no access token', () => {
      actor = createActor(filesMachine, {});
      actor.start();

      actor.send({ type: 'DELETE_TURN_FILE', turnId: 'turn-1' });

      expect(actor.getSnapshot().value).toBe('idle');
    });

    it('should transition to deletingFile state when access token exists', () => {
      actor = createActor(filesMachine, {});
      actor.start();
      actor.send({ type: 'SET_AUTH', accessToken: 'test-token' });

      actor.send({ type: 'DELETE_TURN_FILE', turnId: 'turn-1' });

      expect(actor.getSnapshot().value).toBe('deletingFile');
      expect(actor.getSnapshot().context.isDeletingFile).toBe(true);
      expect(actor.getSnapshot().context.deletingFileTurnId).toBe('turn-1');
    });

    it('should call StorageService.deleteTurnFile with correct parameters', async () => {
      actor = createActor(filesMachine, {});
      actor.start();
      actor.send({ type: 'SET_AUTH', accessToken: 'test-token' });

      actor.send({ type: 'DELETE_TURN_FILE', turnId: 'turn-1' });

      await vi.runAllTimersAsync();

      expect(mockDeleteTurnFile).toHaveBeenCalledWith('test-token', 'turn-1');
    });

    it('should update data machine and show success snackbar on successful delete', async () => {
      actor = createActor(filesMachine, {});
      actor.start();
      actor.send({ type: 'SET_AUTH', accessToken: 'test-token' });

      actor.send({ type: 'DELETE_TURN_FILE', turnId: 'turn-1' });

      await vi.runAllTimersAsync();

      expect(mockOrchestrator.sendToMachine).toHaveBeenCalledWith('data', {
        type: 'REMOVE_TURN_FILE',
        turnId: 'turn-1'
      });

      expect(mockOrchestrator.sendToMachine).toHaveBeenCalledWith('ui', {
        type: 'OPEN_SNACKBAR',
        message: 'Archivo eliminado exitosamente',
        severity: 'success'
      });

      expect(actor.getSnapshot().value).toBe('idle');
      expect(actor.getSnapshot().context.isDeletingFile).toBe(false);
      expect(actor.getSnapshot().context.deleteSuccess).toBe('Archivo eliminado exitosamente');
    });

    it('should handle delete error and show error snackbar', async () => {
      mockDeleteTurnFile.mockRejectedValueOnce(new Error('Delete failed'));

      actor = createActor(filesMachine, {});
      actor.start();
      actor.send({ type: 'SET_AUTH', accessToken: 'test-token' });

      actor.send({ type: 'DELETE_TURN_FILE', turnId: 'turn-1' });

      await vi.runAllTimersAsync();

      expect(mockOrchestrator.sendToMachine).toHaveBeenCalledWith('ui', {
        type: 'OPEN_SNACKBAR',
        message: 'Delete failed',
        severity: 'error'
      });

      expect(actor.getSnapshot().value).toBe('idle');
      expect(actor.getSnapshot().context.isDeletingFile).toBe(false);
      expect(actor.getSnapshot().context.deleteError).toBe('Delete failed');
    });
  });

  describe('CLEAR Events', () => {
    it('should clear upload success', () => {
      actor = createActor(filesMachine, {});
      actor.start();

      actor.send({ type: 'CLEAR_UPLOAD_SUCCESS' });

      expect(actor.getSnapshot().context.uploadSuccess).toBeNull();
    });

    it('should clear delete success', () => {
      actor = createActor(filesMachine, {});
      actor.start();

      actor.send({ type: 'CLEAR_DELETE_SUCCESS' });

      expect(actor.getSnapshot().context.deleteSuccess).toBeNull();
    });

    it('should clear all errors', () => {
      actor = createActor(filesMachine, {});
      actor.start();

      actor.send({ type: 'CLEAR_ERROR' });

      expect(actor.getSnapshot().context.uploadError).toBeNull();
      expect(actor.getSnapshot().context.deleteError).toBeNull();
    });
  });
});