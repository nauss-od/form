export type CourseFormInput = {
  activityName?: string;
  venue?: string;
  startDate?: string;
  endDate?: string;
  participantCount?: number | null;
};

export type PublicSubmissionInput = {
  fullNamePassport: string;
  passportNumber: string;
  passportExpiry: string;
  nationalId: string;
  mobile: string;
  birthDate: string;
  iban: string;
};
