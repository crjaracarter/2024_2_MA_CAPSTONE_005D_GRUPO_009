// src/app/core/interfaces/job-offer/job-offer.interface.ts

export enum JobOfferStatus {
  DRAFT = 'draft',           // Borrador
  PUBLISHED = 'published',   // Publicada
  PAUSED = 'paused',        // Pausada
  CLOSED = 'closed',        // Cerrada
  ARCHIVED = 'archived'      // Archivada
}

export enum JobType {
  FULL_TIME = 'full-time',
  PART_TIME = 'part-time',
  CONTRACT = 'contract',
  TEMPORARY = 'temporary',
  INTERNSHIP = 'internship'
}

export enum WorkModality {
  ON_SITE = 'on-site',
  REMOTE = 'remote',
  HYBRID = 'hybrid'
}

export enum ExperienceLevel {
  TRAINEE = 'trainee',
  JUNIOR = 'junior',
  SEMI_SENIOR = 'semi-senior',
  SENIOR = 'senior',
  LEAD = 'lead',
  MANAGER = 'manager',
  DIRECTOR = 'director'
}

export interface Salary {
  min: number;
  max: number;
  currency: string;
  period: 'hourly' | 'monthly' | 'yearly';
  isNegotiable: boolean;
  showInOffer: boolean;
}

export interface JobBenefit {
  id: string;
  category: string;
  title: string;
  description: string;
  iconName?: string;
}

export interface JobOffer {
  id?: string;
  empresaId: string;
  employerId: string;
  companyName: string;
  title: string;
  description: string;
  shortDescription: string;  // Para vistas previas
  department: string;
  status: JobOfferStatus;
  type: JobType;
  modality: WorkModality;
  experienceLevel: ExperienceLevel;
  
  // Localización
  location: {
    country: string;
    region: string;
    city: string;
    isRemoteAllowed: boolean;
    allowedCountriesForRemote?: string[];
  };
  
  // Detalles de la posición
  salary: Salary;
  positions: number;  // Número de vacantes
  benefits: JobBenefit[];
  requirements: {
    essential: string[];
    desirable: string[];
  };
  skills: {
    technical: string[];
    soft: string[];
  };
  
  // Fechas importantes
  publishedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Proceso de postulación
  formTemplateId?: string;
  applicationDeadline?: Date;
  applicationProcess: {
    steps: string[];
    estimatedDuration: string;
  };
  
  // Métricas y seguimiento
  metrics: {
    views: number;
    applications: number;
    shares: number;
  };
  
  // SEO y visibilidad
  keywords: string[];
  isHighlighted: boolean;
  isConfidential: boolean;
  
  // Control y seguimiento
  applicants?: string[];  // UIDs de usuarios que han postulado
  internalNotes?: string;
  lastModifiedBy?: string;
  version: number;
}