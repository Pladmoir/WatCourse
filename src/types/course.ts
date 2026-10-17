export interface Course {
  courseId: string;
  subjectCode: string;
  catalogNumber: string;
  title: string;
  descriptionAbbreviated: string;
  description: string;
  associatedAcademicCareer: string;
  associatedAcademicGroupCode: string;
  associatedAcademicOrgCode: string;
  gradingBasis: string;
  courseComponentCode: string;
  enrollConsentCode: string;
  enrollConsentDescription: string;
  dropConsentCode: string;
  dropConsentDescription: string;
  requirementsDescription: string | null;
}