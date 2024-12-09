// src/app/services/storage/file-storage.service.ts
import { Injectable } from '@angular/core';
import { Storage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { AuthService } from '../../auth/data-access/auth.service';

export interface UploadProgress {
  progress: number;
  downloadUrl?: string;
  state: 'running' | 'paused' | 'success' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class FileStorageService {
  constructor(
    private storage: Storage,
    private authService: AuthService
  ) {}

  async uploadCV(file: File): Promise<string> {
    const user = await this.authService.getCurrentUser();
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    // Validar el tipo de archivo
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Tipo de archivo no permitido. Solo se permiten archivos PDF y Word.');
    }

    // Validar el tamaño del archivo (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB en bytes
    if (file.size > maxSize) {
      throw new Error('El archivo excede el tamaño máximo permitido de 5MB.');
    }

    // Generar un nombre único para el archivo
    const fileExtension = file.name.split('.').pop();
    const timestamp = Date.now();
    const fileName = `cv_${timestamp}.${fileExtension}`;
    const filePath = `cv/${user.uid}/${fileName}`;

    // Crear referencia al archivo
    const fileRef = ref(this.storage, filePath);

    try {
      // Subir el archivo con seguimiento de progreso
      const uploadTask = uploadBytesResumable(fileRef, file, {
        contentType: file.type
      });

      // Retornar una promesa que se resuelve con la URL de descarga
      return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
          // Progreso
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload progress: ${progress}%`);
          },
          // Error
          (error) => {
            console.error('Error uploading file:', error);
            reject(error);
          },
          // Completado
          async () => {
            try {
              const downloadURL = await getDownloadURL(fileRef);
              resolve(downloadURL);
            } catch (error) {
              console.error('Error getting download URL:', error);
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error('Error in upload process:', error);
      throw error;
    }
  }

  // Método para eliminar CVs antiguos si es necesario
  async deleteOldCV(userId: string, fileUrl: string): Promise<void> {
    try {
      const fileRef = ref(this.storage, fileUrl);
      await deleteObject(fileRef);
    } catch (error) {
      console.error('Error deleting old CV:', error);
      // No lanzamos el error para no interrumpir el flujo principal
    }
  }
}