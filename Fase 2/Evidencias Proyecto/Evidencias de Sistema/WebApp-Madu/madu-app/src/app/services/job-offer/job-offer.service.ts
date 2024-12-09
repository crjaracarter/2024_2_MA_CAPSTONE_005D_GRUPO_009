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
import { Observable, firstValueFrom, from, map } from 'rxjs';
import {
  JobOffer,
  JobOfferStatus,
} from '../../core/interfaces/job-offer/job-offer.interface';
import { AuthService } from '../../auth/data-access/auth.service';
import {
  UserRole,
  Empleador,
  User,
  Empleado,
} from '../../core/interfaces/user.interface';
import { JobApplication } from '../../core/interfaces/job-application/job-application.interface';
import { JobApplicationRequest } from '../../core/interfaces/job-application/job-application-request.interface';
import { EmpresaService } from '../empresa/empresa.service';
import { FormTemplateService } from '../application-form/form-template.service';

@Injectable({
  providedIn: 'root',
})
export class JobOfferService {
  
  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    private empresaService: EmpresaService,
    private formTemplateService: FormTemplateService 
  ) {}

  getJobOffersByCompany(empresaId: string): Observable<JobOffer[]> {
    console.log('getJobOffersByCompany - empresaId:', empresaId);
    const jobOffersRef = collection(this.firestore, 'jobOffers');
    const q = query(jobOffersRef, where('empresaId', '==', empresaId));
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

  // Crear oferta laboral con validación de rol
  async createJobOffer(jobOffer: Omit<JobOffer, 'id'>): Promise<string> {
    try {
      const user = await firstValueFrom(this.authService.getUserData());

      if (user?.rol !== UserRole.EMPLEADOR) {
        throw new Error('Solo los empleadores pueden crear ofertas');
      }

      // Obtener la empresa asociada al empleador
      if (!user?.uid) {
        throw new Error('El usuario no tiene un UID válido');
      }
      const empresa = await this.empresaService.getEmpresaByEmpleadorId(
        user.uid
      );
      if (!empresa) {
        throw new Error('No se encontró una empresa asociada al empleador');
      }

      // Crear la oferta con todos los campos necesarios
      const jobOffersRef = collection(this.firestore, 'jobOffers');
      const newOffer = {
        ...jobOffer,
        employerId: user.uid,
        empresaId: empresa.id, // Agregar el ID de la empresa
        companyName: empresa.nombreEmpresa, // Usar el nombre de la empresa
        department: jobOffer.department || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: JobOfferStatus.PUBLISHED,
        metrics: {
          views: 0,
          applications: 0,
          shares: 0,
        },
        applicants: [],
        keywords: [],
        isHighlighted: false,
        isConfidential: false,
      };

      console.log('Creando nueva oferta:', newOffer);

      const docRef = await addDoc(jobOffersRef, newOffer);
      console.log('Oferta creada con ID:', docRef.id);
      // Crear el template de formulario asociado

      const templateId = await this.formTemplateService.createFormTemplate(
        docRef.id,  // jobOfferId
        user.uid    // employerId
      );
      await updateDoc(doc(this.firestore, 'jobOffers', docRef.id), {
        formTemplateId: templateId
      });

      // await this.formTemplateService.createFormTemplate({
      //   jobOfferId: docRef.id,
      //   employerId: user.uid,
      //   title: `Formulario de postulación - ${newOffer.title}`,
      //   description: 'Formulario de postulación personalizado',
      //   questions: [],
      // });

      return docRef.id;
    } catch (error) {
      console.error('Error creating job offer:', error);
      throw error;
    }

    

    
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
        snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            publishedAt: data['publishedAt']?.toDate(),
            expiresAt: data['expiresAt']?.toDate(),
            createdAt: data['createdAt']?.toDate(),
            updatedAt: data['updatedAt']?.toDate(),
          } as JobOffer;
        })
      )
    );
  }

  async getJobOffersByEmployerId(employerId: string): Promise<JobOffer[]> {
    try {
      console.log('Service: Buscando ofertas para empleador:', employerId);

      // Primero, verificar si existe el empleador
      const empleadorRef = doc(this.firestore, `empleador/${employerId}`);
      const empleadorDoc = await getDoc(empleadorRef);

      if (!empleadorDoc.exists()) {
        console.log('No se encontró el documento del empleador');
        return [];
      }

      // Luego buscar las ofertas
      const jobOffersRef = collection(this.firestore, 'jobOffers');
      const q = query(jobOffersRef, where('employerId', '==', employerId));
      const querySnapshot = await getDocs(q);

      console.log('Documentos encontrados:', querySnapshot.size);

      const offers = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as JobOffer)
      );

      console.log('Ofertas encontradas:', offers);
      return offers;
    } catch (error) {
      console.error('Error obteniendo ofertas:', error);
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
        const jobOffer = {
          id: jobDoc.id,
          ...jobDoc.data(),
        } as JobOffer;
        console.log('Datos de la oferta laboral:', jobOffer);
        return jobOffer;
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
    try {
      const applicationsRef = collection(this.firestore, 'jobApplications');
      const q = query(applicationsRef, where('jobOfferId', '==', jobOfferId));
      const snapshot = await getDocs(q);

      // Primero obtener la oferta laboral para tener el título
      const jobOffer = await this.getJobOfferById(jobOfferId);

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
            jobTitle: jobOffer?.title || 'Sin título', // Agregar el título
            employeeData: {
              nombres: employeeData?.nombres,
              apellidos: employeeData?.apellidos,
              email: employeeData?.email,
            },
          };
        })
      );
    } catch (error) {
      console.error('Error getting applications:', error);
      return [];
    }
  }

  async getAllEmployerApplications(
    employerId: string
  ): Promise<JobApplication[]> {
    try {
      // Primero obtener todas las ofertas del empleador
      const jobOffersRef = collection(this.firestore, 'jobOffers');
      const q = query(jobOffersRef, where('employerId', '==', employerId));
      const jobOffersSnapshot = await getDocs(q);
      console.log('Ofertas encontradas:', jobOffersSnapshot.docs.length);

      const applications: JobApplication[] = [];

      for (const jobOfferDoc of jobOffersSnapshot.docs) {
        const jobOffer = {
          id: jobOfferDoc.id,
          ...jobOfferDoc.data(),
        } as JobOffer;

        // Buscar aplicaciones para esta oferta
        const applicationsRef = collection(this.firestore, 'jobApplications');
        const applicationsQuery = query(
          applicationsRef,
          where('jobOfferId', '==', jobOfferDoc.id)
        );
        const applicationsSnapshot = await getDocs(applicationsQuery);
        console.log(
          `Aplicaciones encontradas para oferta ${jobOffer.title}:`,
          applicationsSnapshot.docs.length
        );

        // Procesar cada aplicación
        for (const appDoc of applicationsSnapshot.docs) {
          const appData = appDoc.data() as JobApplication;

          // Obtener datos del empleado
          const employeeDoc = await getDoc(
            doc(this.firestore, 'users', appData.employeeId)
          );
          const employeeData = employeeDoc.data() as User;

          applications.push({
            id: appDoc.id,
            ...appData,
            jobTitle: jobOffer.title,
            employeeData: {
              nombres: employeeData?.nombres,
              apellidos: employeeData?.apellidos,
              email: employeeData?.email,
            },
          });
        }
      }

      console.log('Total de aplicaciones procesadas:', applications.length);
      return applications;
    } catch (error) {
      console.error('Error obteniendo aplicaciones:', error);
      return [];
    }
  }

  async createJobApplication(
    application: JobApplicationRequest
    
  ): Promise<string> {
    try {
      // Primero obtener la oferta de trabajo para tener el título
      const jobOffer = await this.getJobOfferById(application.jobOfferId);

      if (!jobOffer) {
        throw new Error('Oferta de trabajo no encontrada');
      }

      const jobApplicationsRef = collection(this.firestore, 'jobApplications');
      const newApplication: JobApplication = {
        jobOfferId: application.jobOfferId,
        jobTitle: application.jobTitle,
        employeeId: application.employeeId,
        status: 'pending',
        appliedAt: new Date(),
        updatedAt: new Date(),
        coverLetter: application.coverLetter || '',
        responses: [],
        createdAt: new Date()
      };

      // Opcional: Actualizar la oferta de trabajo para incluir este postulante
      const jobRef = doc(this.firestore, 'jobOffers', application.jobOfferId);
      await updateDoc(jobRef, {
        applicants: [...(jobOffer.applicants || []), application.employeeId],
      });

      const docRef = await addDoc(collection(this.firestore, 'jobApplications'), newApplication);
    return docRef.id;
  } catch (error) {
    console.error('Error creating job application:', error);
    throw error;
  }
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

  async getJobApplicationById(
    applicationId: string
  ): Promise<JobApplication | null> {
    try {
      const applicationRef = doc(
        this.firestore,
        'jobApplications',
        applicationId
      );
      const applicationDoc = await getDoc(applicationRef);

      if (!applicationDoc.exists()) {
        return null;
      }

      const application = {
        id: applicationDoc.id,
        ...applicationDoc.data(),
      } as JobApplication;

      // Obtener datos adicionales de la oferta
      const jobOffer = await this.getJobOfferById(application.jobOfferId);
      if (jobOffer) {
        application.jobTitle = jobOffer.title;
      }

      return application;
    } catch (error) {
      console.error('Error getting application:', error);
      return null;
    }
  }
  async hasUserApplied(jobOfferId: string, userId: string): Promise<boolean> {
    try {
      const applicationsRef = collection(this.firestore, 'jobApplications');
      const q = query(
        applicationsRef, 
        where('jobOfferId', '==', jobOfferId),
        where('employeeId', '==', userId)
      );
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking application:', error);
      return false;
    }
  }
}
