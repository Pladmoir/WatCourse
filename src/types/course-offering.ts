export type AcademicTerm = "Fall" | "Winter" | "Spring";
export type OfferingStatus = "OFFERED" | "NOT_FOUND";

export interface CourseOffering {
  courseId: string;
  termCode: string;
  status: OfferingStatus;
  checkedAt: string;
}
