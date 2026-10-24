"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  DEFAULT_PLAN,
  findRoadmapTerm,
  seasonForTermCode,
  termKind,
  type CoursePlanStatus,
  type PlanData,
  type PlannedCourse,
  type TermKind,
} from "@/lib/plan";
import type { Course } from "@/types/course";

const STORAGE_KEY = "termwise-plan-v1";

type PlanContextValue = {
  plan: PlanData;
  hydrated: boolean;
  addCourse: (course: Course, offeringTermCode: string) => { added: boolean; reason?: string };
  removeCourse: (courseId: string) => void;
  setCourseStatus: (courseId: string, status: CoursePlanStatus) => void;
  moveCourse: (courseId: string, termId: string | null) => { moved: boolean; reason?: string };
  setTermKind: (termId: string, kind: TermKind) => { changed: boolean; reason?: string };
};

const PlanContext = createContext<PlanContextValue | null>(null);

function parseStoredPlan(raw: string | null): PlanData {
  if (!raw) return DEFAULT_PLAN;
  try {
    const value = JSON.parse(raw) as Partial<PlanData>;
    return {
      courses: Array.isArray(value.courses) ? value.courses : [],
      termKinds: { ...DEFAULT_PLAN.termKinds, ...(value.termKinds ?? {}) },
    };
  } catch {
    return DEFAULT_PLAN;
  }
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<PlanData>(DEFAULT_PLAN);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) {
        setPlan(parseStoredPlan(window.localStorage.getItem(STORAGE_KEY)));
        setHydrated(true);
      }
    });

    function handleStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY) setPlan(parseStoredPlan(event.newValue));
    }
    window.addEventListener("storage", handleStorage);
    return () => {
      active = false;
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const serialized = JSON.stringify(plan);
    if (window.localStorage.getItem(STORAGE_KEY) !== serialized) {
      window.localStorage.setItem(STORAGE_KEY, serialized);
    }
  }, [hydrated, plan]);

  const addCourse = useCallback((course: Course, offeringTermCode: string) => {
    if (plan.courses.some((item) => item.courseId === course.courseId)) {
      return { added: false, reason: "This course is already in your roadmap." };
    }
    const season = seasonForTermCode(offeringTermCode);
    const roadmapTermId = findRoadmapTerm(plan, season);
    const nextCourse: PlannedCourse = {
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
    setPlan({ ...plan, courses: [...plan.courses, nextCourse] });
    return { added: true };
  }, [plan]);

  const removeCourse = useCallback((courseId: string) => {
    setPlan((current) => ({ ...current, courses: current.courses.filter((item) => item.courseId !== courseId) }));
  }, []);

  const setCourseStatus = useCallback((courseId: string, status: CoursePlanStatus) => {
    setPlan((current) => ({
      ...current,
      courses: current.courses.map((item) => item.courseId === courseId ? { ...item, status } : item),
    }));
  }, []);

  const moveCourse = useCallback((courseId: string, termId: string | null) => {
    const course = plan.courses.find((item) => item.courseId === courseId);
    if (!course) return { moved: false, reason: "Course not found in your plan." };
    if (termId && termKind(plan, termId) === "OFF") {
      return { moved: false, reason: "Off terms cannot contain courses. Change the term type first." };
    }
    if (termId && termKind(plan, termId) === "WORK") {
      const count = plan.courses.filter((item) => item.roadmapTermId === termId && item.courseId !== courseId).length;
      if (count >= 2) return { moved: false, reason: "Work terms can contain at most two courses." };
    }
    setPlan({ ...plan, courses: plan.courses.map((item) => item.courseId === courseId ? { ...item, roadmapTermId: termId } : item) });
    return { moved: true };
  }, [plan]);

  const setTermKind = useCallback((termId: string, kind: TermKind) => {
    const count = plan.courses.filter((item) => item.roadmapTermId === termId).length;
    if (kind === "OFF" && count > 0) {
      return { changed: false, reason: "Move or remove this term's courses before marking it as an off term." };
    }
    if (kind === "WORK" && count > 2) {
      return { changed: false, reason: "Move or remove courses until this term has no more than two." };
    }
    setPlan({ ...plan, termKinds: { ...plan.termKinds, [termId]: kind } });
    return { changed: true };
  }, [plan]);

  const value = useMemo(() => ({ plan, hydrated, addCourse, removeCourse, setCourseStatus, moveCourse, setTermKind }), [plan, hydrated, addCourse, removeCourse, setCourseStatus, moveCourse, setTermKind]);

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan() {
  const value = useContext(PlanContext);
  if (!value) throw new Error("usePlan must be used within PlanProvider");
  return value;
}

