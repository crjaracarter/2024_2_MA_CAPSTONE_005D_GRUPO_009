import { ApplicationStatus } from "./application-status.enum";

// src/app/core/interfaces/job-application/application-tracking.interface.ts
export interface ApplicationTracking {
    status: ApplicationStatus;
    updatedAt: Date;
    notes?: string;
    nextSteps?: string;
    interviewDate?: Date;
  }