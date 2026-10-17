export type AcademicTerm = "Fall" | "Winter" | "Spring";

export interface CourseOffering {
  courseId: string;
  courseOfferNumber: number;
  termCode: string;
  termName: string;
  term: AcademicTerm;
}
