export interface JobApplicationRequest {
  jobOfferId: string;
  employeeId: string;
  coverLetter: string;
  responses?: {
    questionId: string;
    answer: string;
  }[];
  cvUrl: string;
  jobTitle: string;
}