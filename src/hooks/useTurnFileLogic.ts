import { useCallback, useRef } from 'react';
import { useMachines } from '#/providers/MachineProvider';
import { useDataMachine } from '#/providers/DataProvider';

// Constantes
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILENAME_LENGTH = 25;

export const useTurnFileLogic = () => {
  const { uiSend, filesState, filesSend } = useMachines();
  const { dataState } = useDataMachine();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const filesContext = filesState.context;
  const dataContext = dataState.context;

  // Validación de archivo optimizada
  const validateFile = useCallback((file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return "El archivo es demasiado grande. El tamaño máximo permitido es 5MB.";
    }
    return null;
  }, []);

  // Manejo de subida de archivo optimizado
  const handleFileUpload = useCallback((turnId: string) => {
    if (fileInputRef.current) {
      (fileInputRef.current as any).turnId = turnId;
      fileInputRef.current.click();
    }
  }, []);

  // Manejo de cambio de archivo optimizado
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !dataContext.accessToken) return;

    const validationError = validateFile(file);
    if (validationError) {
      uiSend({
        type: "OPEN_SNACKBAR",
        message: validationError,
        severity: "error"
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    const turnId = (event.target as any).turnId;
    filesSend({
      type: "UPLOAD_TURN_FILE",
      turnId,
      file
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [dataContext.accessToken, validateFile, uiSend, filesSend]);

  // Manejo de eliminación de archivo
  const handleDeleteFile = useCallback((turnId: string) => {
    uiSend({
      type: "OPEN_CONFIRMATION_DIALOG",
      action: "delete_file",
      turnId,
      title: "Eliminar Archivo",
      message: "¿Estás seguro de que quieres eliminar este archivo? Esta acción no se puede deshacer.",
      confirmButtonText: "Eliminar Archivo",
      confirmButtonColor: "error"
    });
  }, [uiSend]);

  // Obtener información de archivo de los turnos
  const getTurnFileInfo = useCallback((turnId: string) => {
    const turn = dataContext.myTurns?.find((t: any) => t.id === turnId);
    if (turn && turn.fileUrl) {
      return {
        url: turn.fileUrl,
        fileName: turn.fileName,
        uploadedAt: turn.uploadedAt
      };
    }
    
    return null;
  }, [dataContext.myTurns]);

  // Obtener estado de archivo de los turnos
  const getFileStatus = useCallback((turnId: string) => {
    const { isUploadingFile, uploadingFileTurnId, isDeletingFile, deletingFileTurnId } = filesContext;
    
    if (isUploadingFile && uploadingFileTurnId === turnId) return "uploading";
    if (isDeletingFile && deletingFileTurnId === turnId) return "deleting";
    
    // Verificar si hay archivo en el turno directamente
    const turn = dataContext.myTurns?.find((t: any) => t.id === turnId);
    if (turn) {
      return turn.fileUrl ? "has-file" : "no-file";
    }
    
    return "no-data";
  }, [filesContext, dataContext]);

  // Truncar nombre de archivo
  const truncateFileName = useCallback((fileName: string | undefined) => {
    if (!fileName) return 'Ver archivo';
    return fileName.length > MAX_FILENAME_LENGTH 
      ? `${fileName.substring(0, MAX_FILENAME_LENGTH)}...` 
      : fileName;
  }, []);

  return {
    fileInputRef,
    filesContext,
    handleFileUpload,
    handleFileChange,
    handleDeleteFile,
    getTurnFileInfo,
    getFileStatus,
    truncateFileName,
    isUploadingFile: filesContext.isUploadingFile,
    isDeletingFile: filesContext.isDeletingFile
  };
};