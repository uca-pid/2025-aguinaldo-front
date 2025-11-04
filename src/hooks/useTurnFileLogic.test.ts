import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTurnFileLogic } from './useTurnFileLogic';

// Mock implementations
const mockUiSend = vi.fn();
const mockFilesSend = vi.fn();

const mockFilesState = {
  context: {
    isUploadingFile: false,
    uploadingFileTurnId: null as string | null,
    isDeletingFile: false,
    deletingFileTurnId: null as string | null
  }
};

const mockDataState = {
  context: {
    accessToken: 'test-token' as string | null,
    myTurns: [
      {
        id: 'turn1',
        fileUrl: 'http://example.com/file.pdf',
        fileName: 'test.pdf',
        uploadedAt: '2023-01-01'
      },
      {
        id: 'turn2',
        fileUrl: null
      }
    ]
  }
};

// Create mock functions that can be reassigned
const mockUseMachines = vi.fn(() => ({
  uiSend: mockUiSend,
  filesState: mockFilesState,
  filesSend: mockFilesSend
}));

const mockUseDataMachine = vi.fn(() => ({
  dataState: mockDataState
}));

// Mock the providers
vi.mock('../providers/MachineProvider', () => ({
  useMachines: () => mockUseMachines()
}));

vi.mock('../providers/DataProvider', () => ({
  useDataMachine: () => mockUseDataMachine()
}));

describe('useTurnFileLogic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset mock implementations to default state
    mockUseMachines.mockReturnValue({
      uiSend: mockUiSend,
      filesState: {
        context: {
          isUploadingFile: false,
          uploadingFileTurnId: null,
          isDeletingFile: false,
          deletingFileTurnId: null
        }
      },
      filesSend: mockFilesSend
    });

    mockUseDataMachine.mockReturnValue({
      dataState: {
        context: {
          accessToken: 'test-token',
          myTurns: [
            {
              id: 'turn1',
              fileUrl: 'http://example.com/file.pdf',
              fileName: 'test.pdf',
              uploadedAt: '2023-01-01'
            },
            {
              id: 'turn2',
              fileUrl: null
            }
          ]
        }
      }
    });
  });

  describe('handleFileUpload', () => {
    it('should click file input and set turnId', () => {
      const { result } = renderHook(() => useTurnFileLogic());

      const mockClick = vi.fn();
      const mockInput = { click: mockClick };
      (result.current.fileInputRef as any).current = mockInput;

      act(() => {
        result.current.handleFileUpload('turn123');
      });

      expect(mockClick).toHaveBeenCalledTimes(1);
      expect((mockInput as any).turnId).toBe('turn123');
    });
  });

  describe('handleFileChange', () => {
    it('should click file input and set turnId', () => {
      const { result } = renderHook(() => useTurnFileLogic());

      const mockClick = vi.fn();
      const mockInput = { click: mockClick };
      (result.current.fileInputRef as any).current = mockInput;

      act(() => {
        result.current.handleFileUpload('turn123');
      });

      expect(mockClick).toHaveBeenCalledTimes(1);
      expect((mockInput as any).turnId).toBe('turn123');
    });
  });

  describe('handleFileChange', () => {
    it('should do nothing if no file selected', () => {
      const { result } = renderHook(() => useTurnFileLogic());

      const event = {
        target: { files: null }
      } as any;

      act(() => {
        result.current.handleFileChange(event);
      });

      expect(mockFilesSend).not.toHaveBeenCalled();
    });

    it('should do nothing if no access token', () => {
      mockUseDataMachine.mockReturnValue({
        dataState: { context: { ...mockDataState.context, accessToken: null } }
      });

      const { result } = renderHook(() => useTurnFileLogic());

      const file = new File(['test'], 'test.pdf');
      const event = {
        target: { files: [file], turnId: 'turn123' }
      } as any;

      act(() => {
        result.current.handleFileChange(event);
      });

      expect(mockFilesSend).not.toHaveBeenCalled();
    });

    it('should show error snackbar for invalid file', () => {
      const { result } = renderHook(() => useTurnFileLogic());

      const largeFile = new File(['test'], 'large.pdf');
      Object.defineProperty(largeFile, 'size', { value: 10 * 1024 * 1024 });

      const mockInput = { files: [largeFile], turnId: 'turn123', value: 'test' };
      (result.current.fileInputRef as any).current = mockInput;

      const event = {
        target: mockInput
      } as any;

      act(() => {
        result.current.handleFileChange(event);
      });

      expect(mockUiSend).toHaveBeenCalledWith({
        type: "OPEN_SNACKBAR",
        message: "El archivo es demasiado grande. El tamaño máximo permitido es 5MB.",
        severity: "error"
      });
      expect(mockFilesSend).not.toHaveBeenCalled();
      expect(mockInput.value).toBe('');
    });

    it('should upload valid file', () => {
      const { result } = renderHook(() => useTurnFileLogic());

      const file = new File(['test'], 'test.pdf');
      Object.defineProperty(file, 'size', { value: 1024 * 1024 });

      const mockInput = { files: [file], turnId: 'turn123', value: 'test' };
      (result.current.fileInputRef as any).current = mockInput;

      const event = {
        target: mockInput
      } as any;

      act(() => {
        result.current.handleFileChange(event);
      });

      expect(mockFilesSend).toHaveBeenCalledWith({
        type: "UPLOAD_TURN_FILE",
        turnId: 'turn123',
        file
      });
      expect(mockInput.value).toBe('');
    });
  });

  describe('handleDeleteFile', () => {
    it('should open confirmation dialog', () => {
      const { result } = renderHook(() => useTurnFileLogic());

      act(() => {
        result.current.handleDeleteFile('turn123');
      });

      expect(mockUiSend).toHaveBeenCalledWith({
        type: "OPEN_CONFIRMATION_DIALOG",
        action: "delete_file",
        turnId: 'turn123',
        title: "Eliminar Archivo",
        message: "¿Estás seguro de que quieres eliminar este archivo? Esta acción no se puede deshacer.",
        confirmButtonText: "Eliminar Archivo",
        confirmButtonColor: "error"
      });
    });
  });

  describe('getTurnFileInfo', () => {
    it('should return file info for turn with file', () => {
      const { result } = renderHook(() => useTurnFileLogic());

      const info = result.current.getTurnFileInfo('turn1');

      expect(info).toEqual({
        url: 'http://example.com/file.pdf',
        fileName: 'test.pdf',
        uploadedAt: '2023-01-01'
      });
    });

    it('should return null for turn without file', () => {
      const { result } = renderHook(() => useTurnFileLogic());

      const info = result.current.getTurnFileInfo('turn2');

      expect(info).toBeNull();
    });

    it('should return null for non-existent turn', () => {
      const { result } = renderHook(() => useTurnFileLogic());

      const info = result.current.getTurnFileInfo('nonexistent');

      expect(info).toBeNull();
    });
  });

  describe('getFileStatus', () => {
    it('should return "uploading" when uploading file for turn', () => {
      mockUseMachines.mockReturnValue({
        uiSend: mockUiSend,
        filesState: {
          context: {
            ...mockFilesState.context,
            isUploadingFile: true,
            uploadingFileTurnId: 'turn1'
          }
        },
        filesSend: mockFilesSend
      });

      const { result } = renderHook(() => useTurnFileLogic());

      expect(result.current.getFileStatus('turn1')).toBe('uploading');
    });

    it('should return "deleting" when deleting file for turn', () => {
      mockUseMachines.mockReturnValue({
        uiSend: mockUiSend,
        filesState: {
          context: {
            ...mockFilesState.context,
            isDeletingFile: true,
            deletingFileTurnId: 'turn1'
          }
        },
        filesSend: mockFilesSend
      });

      const { result } = renderHook(() => useTurnFileLogic());

      expect(result.current.getFileStatus('turn1')).toBe('deleting');
    });

    it('should return "has-file" for turn with file', () => {
      const { result } = renderHook(() => useTurnFileLogic());

      expect(result.current.getFileStatus('turn1')).toBe('has-file');
    });

    it('should return "no-file" for turn without file', () => {
      const { result } = renderHook(() => useTurnFileLogic());

      expect(result.current.getFileStatus('turn2')).toBe('no-file');
    });

    it('should return "no-data" for non-existent turn', () => {
      const { result } = renderHook(() => useTurnFileLogic());

      expect(result.current.getFileStatus('nonexistent')).toBe('no-data');
    });
  });

  describe('truncateFileName', () => {
    it('should return default text for undefined filename', () => {
      const { result } = renderHook(() => useTurnFileLogic());

      expect(result.current.truncateFileName(undefined)).toBe('Ver archivo');
    });

    it('should return filename if within limit', () => {
      const { result } = renderHook(() => useTurnFileLogic());

      expect(result.current.truncateFileName('short.pdf')).toBe('short.pdf');
    });

    it('should truncate filename if too long', () => {
      const { result } = renderHook(() => useTurnFileLogic());

      const longName = 'a'.repeat(30) + '.pdf';
      const truncated = result.current.truncateFileName(longName);

      expect(truncated).toBe('a'.repeat(25) + '...');
      expect(truncated.length).toBe(28); // 25 + 3 + ...
    });
  });

  describe('returned values', () => {
    it('should return correct values', () => {
      const { result } = renderHook(() => useTurnFileLogic());

      expect(result.current.fileInputRef).toBeDefined();
      expect(result.current.filesContext).toStrictEqual({
        isUploadingFile: false,
        uploadingFileTurnId: null,
        isDeletingFile: false,
        deletingFileTurnId: null
      });
      expect(result.current.isUploadingFile).toBe(false);
      expect(result.current.isDeletingFile).toBe(false);
      expect(typeof result.current.handleFileUpload).toBe('function');
      expect(typeof result.current.handleFileChange).toBe('function');
      expect(typeof result.current.handleDeleteFile).toBe('function');
      expect(typeof result.current.getTurnFileInfo).toBe('function');
      expect(typeof result.current.getFileStatus).toBe('function');
      expect(typeof result.current.truncateFileName).toBe('function');
    });
  });
});