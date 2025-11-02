import React from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachFileIcon from '@mui/icons-material/AttachFile';

interface FileActionsProps {
  turnId: string;
  fileStatus: string;
  canUploadFile: boolean;
  canDeleteFile: boolean;
  fileInfo: any;
  isUploadingFile: boolean;
  isDeletingFile: boolean;
  onFileUpload: (turnId: string) => void;
  onFileDelete: (turnId: string) => void;
  truncateFileName: (fileName: string | undefined) => string;
}

const FileActions: React.FC<FileActionsProps> = ({
  turnId,
  fileStatus,
  canUploadFile,
  canDeleteFile,
  fileInfo,
  isUploadingFile,
  isDeletingFile,
  onFileUpload,
  onFileDelete,
  truncateFileName
}) => {
  if (fileStatus === "loading" || fileStatus === "no-data") {
    return (
      <Button
        variant="text"
        size="small"
        disabled
        className="viewturns-load-file-info-btn"
      >
        <CircularProgress size={16} sx={{ mr: 1 }} />
        {fileStatus === "loading" ? "Verificando archivos..." : "Cargando información de archivos..."}
      </Button>
    );
  }

  if (fileStatus === "uploading") {
    return (
      <Button
        variant="outlined"
        size="small"
        disabled
        className="viewturns-upload-btn"
      >
        <CircularProgress size={16} sx={{ mr: 1 }} />
        Subiendo...
      </Button>
    );
  }

  if (fileStatus === "no-file") {
    return canUploadFile ? (
      <Box className="viewturns-upload-section">
        <Button
          variant="outlined"
          size="small"
          startIcon={<CloudUploadIcon />}
          onClick={() => onFileUpload(turnId)}
          disabled={isUploadingFile}
          className="viewturns-upload-btn"
        >
          Subir archivo
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mt: 0.5 }}>
          Tamaño máximo 5MB
        </Typography>
      </Box>
    ) : null;
  }

  if (fileStatus === "deleting") {
    return (
      <>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AttachFileIcon />}
          onClick={() => window.open(fileInfo?.url, '_blank')}
          className="viewturns-view-file-btn"
          disabled
        >
          {truncateFileName(fileInfo?.fileName)}
        </Button>
        <Button
          variant="outlined"
          size="small"
          color="error"
          disabled
          className="viewturns-delete-file-btn"
        >
          <CircularProgress size={16} sx={{ mr: 1 }} />
          Eliminando...
        </Button>
      </>
    );
  }

  if (fileStatus === "has-file") {
    return (
      <>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AttachFileIcon />}
          onClick={() => window.open(fileInfo?.url, '_blank')}
          className="viewturns-view-file-btn"
        >
          {truncateFileName(fileInfo?.fileName)}
        </Button>
        {canDeleteFile && (
          <Button
            variant="outlined"
            size="small"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => onFileDelete(turnId)}
            disabled={isDeletingFile}
            className="viewturns-delete-file-btn"
          >
            Eliminar archivo
          </Button>
        )}
      </>
    );
  }

  return null;
};

export default FileActions;