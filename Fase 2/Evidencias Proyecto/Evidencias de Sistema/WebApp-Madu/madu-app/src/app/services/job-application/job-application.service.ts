import { Injectable } from '@angular/core';
import { Firestore, collection, query, where, getDocs, doc, updateDoc, getDoc } from '@angular/fire/firestore';
import { JobApplication } from '../../core/interfaces/job-application/job-application.interface';
import { ApplicationStatus } from '../../core/interfaces/job-application/application-status.enum';
import { AuthStateService } from '../../shared/data-access/auth-state.service';

@Injectable({
  providedIn: 'root'
})
export class JobApplicationService {
  constructor(
    private firestore: Firestore,
    private authStateService: AuthStateService
  ) {}

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
    const applicationRef = doc(this.firestore, 'jobApplications', applicationId);
    await updateDoc(applicationRef, {
      status,
      updatedAt: new Date()
    });
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
}