// src/app/core/interfaces/application-form/form-template.interface.ts

import { FormQuestion } from "./form-question.interface";
import { FormSection } from "./form-section.interface";

export interface FormTemplateSettings {
  allowSave: boolean;
  showProgressBar: boolean;
  randomizeQuestions: boolean;
  timeLimit?: number;
  maxAttempts?: number;
  notifyOnSubmission: boolean;
  debugMode?: boolean; // Añadimos esta propiedad
}

export interface FormTemplate {
  id: string;
  jobOfferId: string;
  employerId: string;
  title: string;
  description: string;
  sections: any[];
  questions: FormQuestion[];
  settings: FormTemplateSettings;
  scoring?: {
    enabled: boolean;
    passingScore?: number;
    maxScore: number;
    showScoreToApplicant: boolean;
  };
  status: 'draft' | 'active' | 'archived';
  version: number;
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy: string;
  isReusable: boolean;
  category?: string;
  tags?: string[];
}

