import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  getDoc,
} from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { JobOffer } from '../../core/interfaces/job-offer/job-offer.interface';
import { AuthService } from '../../auth/data-access/auth.service';
import {
  UserRole,
  Empleador,
  User,
  Empleado,
} from '../../core/interfaces/user.interface';
import { JobApplication } from '../../core/interfaces/job-application/job-application.interface';


@Injectable({
  providedIn: 'root',
})
export class JobOfferService {
  constructor(private firestore: Firestore, private authService: AuthService) {}

  // Crear oferta laboral con validación de rol
  async createJobOffer(jobOffer: Omit<JobOffer, 'id'>): Promise<string> {
    return new Promise((resolve, reject) => {
      this.authService.getUserData().subscribe(async (user) => {
        if (user?.rol !== UserRole.EMPLEADOR) {
          reject(new Error('Solo los empleadores pueden crear ofertas'));
          return;
        }

        try {
          const jobOffersRef = collection(this.firestore, 'jobOffers');
          const docRef = await addDoc(jobOffersRef, {
            ...jobOffer,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'active',
            applicants: [],
          });
          resolve(docRef.id);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  // Obtener todas las ofertas laborales
  getJobOffers(): Observable<JobOffer[]> {
    const jobOffersRef = collection(this.firestore, 'jobOffers');
    return from(getDocs(jobOffersRef)).pipe(
      map((snapshot) =>
        snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as JobOffer)
        )
      )
    );
  }

  // Obtener ofertas por empleador
  getJobOffersByEmployer(employerId: string): Observable<JobOffer[]> {
    const jobOffersRef = collection(this.firestore, 'jobOffers');
    const q = query(jobOffersRef, where('employerId', '==', employerId));
    return from(getDocs(q)).pipe(
      map((snapshot) =>
        snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as JobOffer)
        )
      )
    );
  }

  async getJobOffersByEmployerId(employerId: string): Promise<JobOffer[]> {
    try {
      const jobOffersRef = collection(this.firestore, 'jobOffers');
      const q = query(jobOffersRef, where('employerId', '==', employerId));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as JobOffer)
      );
    } catch (error) {
      console.error('Error fetching employer job offers:', error);
      return [];
    }
  }

  // Aplicar a una oferta
  async applyToJob(jobOfferId: string, userId: string): Promise<void> {
    const jobRef = doc(this.firestore, 'jobOffers', jobOfferId);
    const jobDoc = await getDoc(jobRef);
    const currentApplicants = jobDoc.data()?.['applicants'] || [];

    if (!currentApplicants.includes(userId)) {
      await updateDoc(jobRef, {
        applicants: [...currentApplicants, userId],
      });
    }
  }

  // Actualizar oferta
  updateJobOffer(id: string, jobOffer: Partial<JobOffer>): Promise<void> {
    const jobRef = doc(this.firestore, 'jobOffers', id);
    return updateDoc(jobRef, {
      ...jobOffer,
      updatedAt: new Date(),
    });
  }

  // Eliminar oferta
  deleteJobOffer(id: string): Promise<void> {
    const jobRef = doc(this.firestore, 'jobOffers', id);
    return deleteDoc(jobRef);
  }

  async getJobOfferById(id: string): Promise<JobOffer | null> {
    try {
      const jobRef = doc(this.firestore, 'jobOffers', id);
      const jobDoc = await getDoc(jobRef);

      if (jobDoc.exists()) {
        return {
          id: jobDoc.id,
          ...jobDoc.data(),
        } as JobOffer;
      }
      return null;
    } catch (error) {
      console.error('Error fetching job offer:', error);
      return null;
    }
  }
  async getApplicationsByJobOffer(
    jobOfferId: string
  ): Promise<JobApplication[]> {
    const applicationsRef = collection(this.firestore, 'jobApplications');
    const q = query(applicationsRef, where('jobOfferId', '==', jobOfferId));
    const snapshot = await getDocs(q);

    return Promise.all(
      snapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data() as JobApplication;
        const employeeDoc = await getDoc(
          doc(this.firestore, 'users', data.employeeId)
        );
        const employeeData = employeeDoc.data() as User;

        return {
          id: docSnapshot.id,
          ...data,
          employeeData: {
            nombres: employeeData?.nombres,
            apellidos: employeeData?.apellidos,
            email: employeeData?.email,
          },
        };
      })
    );
  }

  async getAllEmployerApplications(
    employerId: string
  ): Promise<JobApplication[]> {
    const jobOffersRef = collection(this.firestore, 'jobOffers');
    const q = query(jobOffersRef, where('employerId', '==', employerId));
    const jobOffersSnapshot = await getDocs(q);
    const jobOfferIds = jobOffersSnapshot.docs.map((doc) => doc.id);

    const applications: JobApplication[] = [];

    for (const jobOfferId of jobOfferIds) {
      const jobApplications = await this.getApplicationsByJobOffer(jobOfferId);
      applications.push(...jobApplications);
    }

    return applications;
  }

  async updateApplicationStatus(
    applicationId: string,
    status: 'accepted' | 'rejected'
  ): Promise<void> {
    const applicationRef = doc(
      this.firestore,
      'jobApplications',
      applicationId
    );
    return updateDoc(applicationRef, {
      status,
      updatedAt: new Date(),
    });
  }
}
