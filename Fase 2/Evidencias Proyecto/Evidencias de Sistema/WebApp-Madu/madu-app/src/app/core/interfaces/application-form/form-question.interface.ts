export interface FormQuestion {
    id: string;
    type: 'text' | 'multiline' | 'select' | 'radio' | 'checkbox';
    question: string;
    required: boolean;
    options?: string[];
    order: number;
  }