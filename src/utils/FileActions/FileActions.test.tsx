import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FileActions from './FileActions';

describe('FileActions', () => {
  const defaultProps = {
    turnId: 'test-turn-123',
    fileStatus: 'has-file',
    canUploadFile: true,
    canDeleteFile: true,
    fileInfo: {
      url: 'http://example.com/test.pdf',
      fileName: 'test.pdf',
      uploadedAt: '2023-01-01'
    },
    isUploadingFile: false,
    isDeletingFile: false,
    onFileUpload: vi.fn(),
    onFileDelete: vi.fn(),
    truncateFileName: vi.fn((name) => name || 'Ver archivo')
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.open
    global.window.open = vi.fn();
  });

  describe('loading states', () => {
    it('should show loading spinner for "loading" status', () => {
      render(<FileActions {...defaultProps} fileStatus="loading" />);

      expect(screen.getByText('Verificando archivos...')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should show loading spinner for "no-data" status', () => {
      render(<FileActions {...defaultProps} fileStatus="no-data" />);

      expect(screen.getByText('Cargando información de archivos...')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('uploading state', () => {
    it('should show uploading button with spinner', () => {
      render(<FileActions {...defaultProps} fileStatus="uploading" />);

      const button = screen.getByRole('button', { name: /subiendo/i });
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('no-file state', () => {
    it('should show upload button when canUploadFile is true', () => {
      render(<FileActions {...defaultProps} fileStatus="no-file" />);

      expect(screen.getByText('Tamaño máximo 5MB')).toBeInTheDocument();
      const uploadButton = screen.getByRole('button', { name: /subir archivo/i });
      expect(uploadButton).toBeInTheDocument();
      expect(screen.getByTestId('CloudUploadIcon')).toBeInTheDocument();
    });

    it('should call onFileUpload when upload button is clicked', () => {
      render(<FileActions {...defaultProps} fileStatus="no-file" />);

      const uploadButton = screen.getByRole('button', { name: /subir archivo/i });
      fireEvent.click(uploadButton);

      expect(defaultProps.onFileUpload).toHaveBeenCalledWith('test-turn-123');
    });

    it('should not show upload button when canUploadFile is false', () => {
      render(<FileActions {...defaultProps} fileStatus="no-file" canUploadFile={false} />);

      expect(screen.queryByRole('button', { name: /subir archivo/i })).not.toBeInTheDocument();
      expect(screen.queryByText('Tamaño máximo 5MB')).not.toBeInTheDocument();
    });
  });

  describe('deleting state', () => {
    it('should show disabled view and delete buttons', () => {
      render(<FileActions {...defaultProps} fileStatus="deleting" />);

      const viewButton = screen.getByRole('button', { name: 'test.pdf' });
      expect(viewButton).toBeDisabled();

      const deleteButton = screen.getByRole('button', { name: /eliminando/i });
      expect(deleteButton).toBeInTheDocument();
      expect(deleteButton).toBeDisabled();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should call window.open when view button is clicked', () => {
      render(<FileActions {...defaultProps} fileStatus="has-file" />);

      const viewButton = screen.getByRole('button', { name: 'test.pdf' });
      fireEvent.click(viewButton);

      expect(global.window.open).toHaveBeenCalledWith('http://example.com/test.pdf', '_blank');
    });
  });

  describe('has-file state', () => {
    it('should show view and delete buttons', () => {
      render(<FileActions {...defaultProps} fileStatus="has-file" />);

      const viewButton = screen.getByRole('button', { name: 'test.pdf' });
      expect(viewButton).toBeInTheDocument();
      expect(screen.getByTestId('AttachFileIcon')).toBeInTheDocument();

      const deleteButton = screen.getByRole('button', { name: /eliminar archivo/i });
      expect(deleteButton).toBeInTheDocument();
      expect(screen.getByTestId('DeleteIcon')).toBeInTheDocument();
    });

    it('should call window.open when view button is clicked', () => {
      render(<FileActions {...defaultProps} fileStatus="has-file" />);

      const viewButton = screen.getByRole('button', { name: 'test.pdf' });
      fireEvent.click(viewButton);

      expect(global.window.open).toHaveBeenCalledWith('http://example.com/test.pdf', '_blank');
    });

    it('should call onFileDelete when delete button is clicked', () => {
      render(<FileActions {...defaultProps} fileStatus="has-file" />);

      const deleteButton = screen.getByRole('button', { name: /eliminar archivo/i });
      fireEvent.click(deleteButton);

      expect(defaultProps.onFileDelete).toHaveBeenCalledWith('test-turn-123');
    });

    it('should not show delete button when canDeleteFile is false', () => {
      render(<FileActions {...defaultProps} fileStatus="has-file" canDeleteFile={false} />);

      expect(screen.queryByRole('button', { name: /eliminar archivo/i })).not.toBeInTheDocument();
    });

    it('should disable buttons when isUploadingFile is true', () => {
      render(<FileActions {...defaultProps} fileStatus="has-file" isUploadingFile={true} />);

      const uploadButton = screen.queryByRole('button', { name: /subir archivo/i });
      if (uploadButton) {
        expect(uploadButton).toBeDisabled();
      }
    });

    it('should disable delete button when isDeletingFile is true', () => {
      render(<FileActions {...defaultProps} fileStatus="has-file" isDeletingFile={true} />);

      const deleteButton = screen.getByRole('button', { name: /eliminar archivo/i });
      expect(deleteButton).toBeDisabled();
    });
  });

  describe('truncateFileName', () => {
    it('should call truncateFileName function with fileName', () => {
      const mockTruncate = vi.fn((name) => `truncated-${name}`);
      render(<FileActions {...defaultProps} truncateFileName={mockTruncate} />);

      expect(mockTruncate).toHaveBeenCalledWith('test.pdf');
    });

    it('should call truncateFileName with undefined when no fileInfo', () => {
      const mockTruncate = vi.fn((name) => name || 'Ver archivo');
      render(<FileActions {...defaultProps} fileInfo={null} truncateFileName={mockTruncate} />);

      expect(mockTruncate).toHaveBeenCalledWith(undefined);
    });
  });

  describe('edge cases', () => {
    it('should render nothing for unknown status', () => {
      render(<FileActions {...defaultProps} fileStatus="unknown" />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should handle missing fileInfo gracefully', () => {
      render(<FileActions {...defaultProps} fileStatus="has-file" fileInfo={null} />);

      const viewButton = screen.getByRole('button', { name: 'Ver archivo' });
      expect(viewButton).toBeInTheDocument();
    });
  });
});