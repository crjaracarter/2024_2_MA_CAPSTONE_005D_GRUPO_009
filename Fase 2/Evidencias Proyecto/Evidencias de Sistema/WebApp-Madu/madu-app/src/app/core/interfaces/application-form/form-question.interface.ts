// src/app/core/interfaces/application-form/form-question.interface.ts

export enum QuestionType {
  SHORT_TEXT = 'short-text',
  LONG_TEXT = 'long-text',
  SINGLE_CHOICE = 'single-choice',
  MULTIPLE_CHOICE = 'multiple-choice',
  FILE_UPLOAD = 'file-upload',
  DATE = 'date',
  NUMBER = 'number',
  EMAIL = 'email',
  PHONE = 'phone',
  URL = 'url',
  RATING = 'rating',
  YES_NO = 'yes-no',
  DROPDOWN = 'dropdown',
  SCALE = 'scale'
}

export interface QuestionValidation {
  required: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  customMessage?: string;
  fileTypes?: string[];
  maxFileSize?: number;
  minValue?: number;
  maxValue?: number;
  scaleRange?: {
    min: number;
    max: number;
  };
    
}

export interface FormQuestion {
  id: string;
  sectionId: string;
  type: QuestionType;
  label: string;
  description?: string;
  placeholder?: string;
  helpText?: string;
  validation: QuestionValidation;
  options?: {
    value: string;
    label: string;
    description?: string;
  }[];
  conditionalDisplay?: {
    dependsOn: string;  // ID de otra pregunta
    condition: 'equals' | 'not-equals' | 'contains' | 'greater-than' | 'less-than';
    value: any;
  };
  scoring?: {
    enabled: boolean;
    maxPoints: number;
    criteria: {
      value: any;
      points: number;
      feedback?: string;
    }[];
  };
  order: number;
  isEditable: boolean;
  isVisible: boolean;
}

