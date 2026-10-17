import type { CourseOffering } from "@/types/course-offering";

export interface TermAvailability {
  termCode: string;
  termName: string;
  status: "offered" | "not_found";
}

export function buildOfferingHistory(
  terms: {
    termCode: string;
    termName: string;
    offerings: CourseOffering[];
    querySucceeded: boolean;
  }[]
): TermAvailability[] {
  return terms.map((term) => {
    return {
      termCode: term.termCode,
      termName: term.termName,
      status: "offered",
    };
  });
}