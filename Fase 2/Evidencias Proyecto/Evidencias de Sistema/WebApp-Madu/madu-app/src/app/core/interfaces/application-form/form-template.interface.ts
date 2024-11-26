import { FormQuestion } from './form-question.interface';

export interface FormTemplate {
    id: string;
    employerId: string;
    title: string;
    questions: FormQuestion[];
    createdAt: Date;
    updatedAt: Date;
  }