import { buildApiUrl, getAuthenticatedFetchOptions } from '../../config/api';

export interface UploadResponse {
  url: string;
  fileName: string;
}

export interface TurnFileInfo {
  url: string;
  fileName: string;
  uploadedAt: string;
}

export interface ErrorResponse {
  error: string;
}

export class StorageService {

  static async uploadTurnFile(
    accessToken: string,
    turnId: string,
    file: File
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('turnId', turnId);
    formData.append('file', file);

    const url = buildApiUrl('/api/storage/upload-turn-file');

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || `Upload failed! Status: ${response.status}`);
      }

      const result: UploadResponse = await response.json();
      return result;
    } catch (error) {
      console.error('Turn file upload failed:', error);
      throw error;
    }
  }

  static async deleteTurnFile(accessToken: string, turnId: string): Promise<void> {
    const url = buildApiUrl(`/api/storage/delete-turn-file/${turnId}`);

    try {
      const response = await fetch(url, {
        ...getAuthenticatedFetchOptions(accessToken),
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Delete failed' }));
        throw new Error(errorData.error || `Delete failed! Status: ${response.status}`);
      }
    } catch (error) {
      console.error('Turn file delete failed:', error);
      throw error;
    }
  }

  static async getTurnFileInfo(accessToken: string, turnId: string): Promise<TurnFileInfo | null> {
    const url = buildApiUrl(`/api/storage/turn-file/${turnId}`);

    try {
      const response = await fetch(url, {
        ...getAuthenticatedFetchOptions(accessToken),
        method: 'GET',
      });

      if (response.status === 404) {
        return null; // No file found for this turn
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Get file info failed' }));
        throw new Error(errorData.error || `Get file info failed! Status: ${response.status}`);
      }

      const result: TurnFileInfo = await response.json();
      return result;
    } catch (error) {
      console.error('Get turn file info failed:', error);
      throw error;
    }
  }

  static async deleteFile(accessToken: string, bucketName: string, fileName: string): Promise<void> {
    const url = buildApiUrl(`/api/storage/delete/${bucketName}/${fileName}`);

    try {
      const response = await fetch(url, {
        ...getAuthenticatedFetchOptions(accessToken),
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Delete failed' }));
        throw new Error(errorData.error || `Delete failed! Status: ${response.status}`);
      }
    } catch (error) {
      console.error('File delete failed:', error);
      throw error;
    }
  }

  static async getPublicUrl(accessToken: string, bucketName: string, fileName: string): Promise<string> {
    const url = buildApiUrl(`/api/storage/url/${bucketName}/${fileName}`);

    try {
      const response = await fetch(url, {
        ...getAuthenticatedFetchOptions(accessToken),
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Get URL failed' }));
        throw new Error(errorData.error || `Get URL failed! Status: ${response.status}`);
      }

      const result: UploadResponse = await response.json();
      return result.url;
    } catch (error) {
      console.error('Get public URL failed:', error);
      throw error;
    }
  }

  static validateFile(file: File): void {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];

    if (!file) {
      throw new Error('Archivo requerido');
    }

    if (file.size > maxSize) {
      throw new Error('El archivo no puede superar los 5MB');
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Solo se permiten archivos PDF, JPG y PNG');
    }

    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!allowedExtensions.includes(extension)) {
      throw new Error('Extensión de archivo no válida');
    }
  }
}