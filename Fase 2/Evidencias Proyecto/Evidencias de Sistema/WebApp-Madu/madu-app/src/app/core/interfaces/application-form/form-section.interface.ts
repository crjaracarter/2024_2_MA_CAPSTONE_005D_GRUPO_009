// src/app/core/interfaces/application-form/form-section.interface.ts

export interface FormSection {
    id: string;
    title: string;
    description?: string;
    order: number;
    isVisible: boolean;
    conditionalDisplay?: {
      dependsOn: string;
      condition: string;
      value: any;
    };
  }