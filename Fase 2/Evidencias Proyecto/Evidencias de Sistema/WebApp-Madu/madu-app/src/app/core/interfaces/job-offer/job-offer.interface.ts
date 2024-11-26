// core/interfaces/job-offer.interface.ts
export interface JobOffer {
    id?: string;
    title: string;
    company: string;
    description: string;
    requirements: string[];
    salary?: {
      min: number;
      max: number;
      currency: string;
    };
    location: string;
    type: 'full-time' | 'part-time' | 'remote' | 'hybrid';
    employerId: string;
    formTemplateId?: string;
    createdAt: Date;
    updatedAt: Date;
    status: 'active' | 'closed';
    applicants?: string[]; // UIDs de usuarios que han postulado
  }
  
  export interface JobApplication {
    userId: string;
    jobOfferId: string;
    status: 'pending' | 'accepted' | 'rejected';
    appliedAt: Date;
    updatedAt: Date;
    coverLetter?: string;
  }
  