import type { Course } from "@/types/course";

export type CoursePlanStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED";
export type TermKind = "STUDY" | "OFF" | "WORK";
export type Season = "Fall" | "Winter" | "Spring";

export interface PlannedCourse {
  courseId: string;
  subjectCode: string;
  catalogNumber: string;
  title: string;
  descriptionAbbreviated: string;
  requirementsDescription: string | null;
  offeringTermCode: string;
  status: CoursePlanStatus;
  roadmapTermId: string | null;
  addedAt: string;
}

export interface PlanData {
  courses: PlannedCourse[];
  termKinds: Record<string, TermKind>;
}

export interface RoadmapTerm {
  id: string;
  yearGroup: number;
  season: Season;
  year: number;
  label: string;
}

export const OFFERING_TERMS = [
  { code: "1261", label: "Winter 2026", season: "Winter" as const },
  { code: "1265", label: "Spring 2026", season: "Spring" as const },
  { code: "1269", label: "Fall 2026", season: "Fall" as const },
];

export const ROADMAP_TERMS: RoadmapTerm[] = Array.from({ length: 5 }, (_, i) => {
  const yearGroup = i + 1;
  const fallYear = 2026 + i;
  const terms: RoadmapTerm[] = [
    { id: `${fallYear}-fall`, yearGroup, season: "Fall", year: fallYear, label: `Fall ${fallYear}` },
    { id: `${fallYear + 1}-winter`, yearGroup, season: "Winter", year: fallYear + 1, label: `Winter ${fallYear + 1}` },
    { id: `${fallYear + 1}-spring`, yearGroup, season: "Spring", year: fallYear + 1, label: `Spring ${fallYear + 1}` },
  ];
  return terms;
}).flat();

export const DEFAULT_PLAN: PlanData = {
  courses: [],
  termKinds: Object.fromEntries(ROADMAP_TERMS.map((term) => [term.id, "STUDY"])),
};

export function courseCode(course: Pick<Course, "subjectCode" | "catalogNumber"> | Pick<PlannedCourse, "subjectCode" | "catalogNumber">) {
  return `${course.subjectCode} ${course.catalogNumber}`;
}

export function seasonForTermCode(code: string): Season {
  return OFFERING_TERMS.find((term) => term.code === code)?.season ?? "Fall";
}

export function termKind(plan: PlanData, termId: string): TermKind {
  return plan.termKinds[termId] ?? "STUDY";
}

export function coursesInTerm(plan: PlanData, termId: string) {
  return plan.courses.filter((course) => course.roadmapTermId === termId);
}

export function findRoadmapTerm(plan: PlanData, season: Season): string | null {
  const candidates = ROADMAP_TERMS.filter(
    (term) => term.season === season && termKind(plan, term.id) !== "OFF",
  ).sort((a, b) => {
    const countDiff = coursesInTerm(plan, a.id).length - coursesInTerm(plan, b.id).length;
    return countDiff || a.year - b.year;
  });

  return candidates.find((term) => {
    const kind = termKind(plan, term.id);
    return kind !== "WORK" || coursesInTerm(plan, term.id).length < 2;
  })?.id ?? null;
}

export function toPlannedCourse(course: Course, offeringTermCode: string, roadmapTermId: string | null): PlannedCourse {
  return {
    courseId: course.courseId,
    subjectCode: course.subjectCode,
    catalogNumber: course.catalogNumber,
    title: course.title,
    descriptionAbbreviated: course.descriptionAbbreviated,
    requirementsDescription: course.requirementsDescription,
    offeringTermCode,
    status: "PLANNED",
    roadmapTermId,
    addedAt: new Date().toISOString(),
  };
}
