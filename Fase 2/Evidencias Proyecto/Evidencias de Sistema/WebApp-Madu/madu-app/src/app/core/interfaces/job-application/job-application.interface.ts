export interface JobApplication {
    id?: string;
    jobOfferId: string;
    jobTitle?: string;  // Para referencia rápida
    employeeId: string;
    employeeData?: {
      nombres: string;
      apellidos: string;
      email: string;
    };
    status: 'pending' | 'accepted' | 'rejected';
    appliedAt: Date;
    updatedAt: Date;
    coverLetter?: string;
  }