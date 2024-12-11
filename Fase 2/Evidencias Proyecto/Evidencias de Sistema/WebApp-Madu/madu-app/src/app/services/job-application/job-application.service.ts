import { Injectable } from '@angular/core';
import { Firestore, collection, query, where, getDocs, doc, updateDoc, getDoc, addDoc, collectionData, deleteDoc  } from '@angular/fire/firestore';
import { JobApplication } from '../../core/interfaces/job-application/job-application.interface';
import { ApplicationStatus } from '../../core/interfaces/job-application/application-status.enum';
import { AuthStateService } from '../../shared/data-access/auth-state.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JobApplicationService {
  constructor(
    private firestore: Firestore,
    private authStateService: AuthStateService
  ) {}

  async createJobApplication(application: Omit<JobApplication, 'id'>): Promise<string> {
    try {
      // Verificar si ya existe una postulación
      const hasExisting = await this.checkExistingApplication(
        application.jobOfferId,
        application.employeeId
      );
  
      if (hasExisting) {
        throw new Error('Ya has postulado a esta oferta anteriormente');
      }
  
      // Si no existe, crear la nueva postulación
      const applicationsRef = collection(this.firestore, 'jobApplications');
      const docRef = await addDoc(applicationsRef, {
        ...application,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating job application:', error);
      throw error;
    }
  }

  async getApplicationsByJobOffer(jobOfferId: string): Promise<JobApplication[]> {
    try {
      const applicationsRef = collection(this.firestore, 'jobApplications');
      const q = query(applicationsRef, where('jobOfferId', '==', jobOfferId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as JobApplication));
    } catch (error) {
      console.error('Error fetching applications:', error);
      return [];
    }
  }

  async getUserApplications(): Promise<JobApplication[]> {
    const userId = this.authStateService.currentUser?.uid;
    if (!userId) throw new Error('Usuario no autenticado');

    const applicationsRef = collection(this.firestore, 'jobApplications');
    const q = query(applicationsRef, where('employeeId', '==', userId));
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as JobApplication));
  }

  async updateApplicationStatus(applicationId: string, status: ApplicationStatus): Promise<void> {
    try {
      const applicationRef = doc(this.firestore, 'jobApplications', applicationId);
      await updateDoc(applicationRef, { 
        status,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  }

  async getApplicationById(id: string): Promise<JobApplication> {
    const applicationRef = doc(this.firestore, 'jobApplications', id);
    const applicationSnap = await getDoc(applicationRef);
    
    if (!applicationSnap.exists()) {
      throw new Error('Postulación no encontrada');
    }
    
    return {
      id: applicationSnap.id,
      ...applicationSnap.data()
    } as JobApplication;
  }

  async deleteApplication(id: string): Promise<void> {
    if (!id) throw new Error('ID de postulación no proporcionado');
    
    const applicationRef = doc(this.firestore, 'jobApplications', id);
    await deleteDoc(applicationRef);
  }

  async checkExistingApplication(jobOfferId: string, userId: string): Promise<boolean> {
    try {
      const applicationsRef = collection(this.firestore, 'jobApplications');
      const q = query(
        applicationsRef, 
        where('jobOfferId', '==', jobOfferId),
        where('employeeId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking existing application:', error);
      throw error;
    }
  }

  
}