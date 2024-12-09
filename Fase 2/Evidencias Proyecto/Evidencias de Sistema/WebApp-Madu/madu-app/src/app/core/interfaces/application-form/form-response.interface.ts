// src/app/core/interfaces/application-form/form-response.interface.ts

import { QuestionType } from "./form-question.interface";

export interface QuestionResponse {
    questionId: string;
    type: QuestionType;
    value: any;
    files?: {
      name: string;
      url: string;
      size: number;
      type: string;
    }[];
    score?: number;
    feedback?: string;
    answeredAt: Date;
  }
  
  export interface FormResponse {
    id: string;
    formTemplateId: string;
    jobOfferId: string;
    applicantId: string;
    responses: QuestionResponse[];
    totalScore?: number;
    status: 'in-progress' | 'completed' | 'evaluated';
    startedAt: Date;
    submittedAt?: Date;
    evaluatedAt?: Date;
    evaluatedBy?: string;
    notes?: string;
  }