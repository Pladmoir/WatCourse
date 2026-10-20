
"use client";

import { useEffect, useMemo, useState } from "react";
import type { Course } from "@/types/course";
import type {
  CourseOffering,
  OfferingStatus,
} from "@/types/course-offering";

const TERMS = [
  { code: "1261", label: "Winter 2026" },
  { code: "1265", label: "Spring 2026" },
  { code: "1269", label: "Fall 2026" },
];

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);

  const [search, setSearch] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("1269");

  const [coursesLoading, setCoursesLoading] = useState(true);
  const [offeringsLoading, setOfferingsLoading] = useState(false);

  const [coursesError, setCoursesError] = useState<string | null>(null);
  const [offeringsError, setOfferingsError] = useState<string | null>(null);

  // Load the course catalogue.
  // Use a fixed catalogue term so changing the selected term
  // does not change the list of courses being searched.
  useEffect(() => {
    let cancelled = false;

    async function loadCourses() {
      setCoursesLoading(true);
      setCoursesError(null);

      try {
        const response = await fetch("/api/courses?term=1269");

        if (!response.ok) {
          throw new Error("Failed to load courses.");
        }

        const data: Course[] = await response.json();

        if (!cancelled) {
          setCourses(data);
        }
      } catch (error) {
        if (!cancelled) {
          setCoursesError(
            error instanceof Error
              ? error.message
              : "An unexpected error occurred."
          );
        }
      } finally {
        if (!cancelled) {
          setCoursesLoading(false);
        }
      }
    }

    loadCourses();

    return () => {
      cancelled = true;
    };
  }, []);

  // Load saved SQL offering statuses for the selected term.
  useEffect(() => {
    let cancelled = false;

    async function loadOfferings() {
      setOfferingsLoading(true);
      setOfferingsError(null);
      setOfferings([]);

      try {
        const response = await fetch(
          `/api/course-offerings?term=${selectedTerm}`
        );

        if (!response.ok) {
          throw new Error("Failed to load course offering statuses.");
        }

        const data: CourseOffering[] = await response.json();

        if (!cancelled) {
          setOfferings(data);
        }
      } catch (error) {
        if (!cancelled) {
          setOfferingsError(
            error instanceof Error
              ? error.message
              : "An unexpected error occurred."
          );
        }
      } finally {
        if (!cancelled) {
          setOfferingsLoading(false);
        }
      }
    }

    loadOfferings();

    return () => {
      cancelled = true;
    };
  }, [selectedTerm]);

  // Build a lookup so each course can find its status quickly.
  const offeringByCourseId = useMemo(() => {
    return new Map(
      offerings.map((offering) => [
        offering.courseId,
        offering,
      ])
    );
  }, [offerings]);

  // Search by subject, catalog number, title, or description.
  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return courses;
    }

    return courses.filter((course) => {
      const searchableText = [
        course.subjectCode,
        course.catalogNumber,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [courses, search]);

  function statusLabel(status: OfferingStatus | undefined) {
    if (!status) {
      return "Not checked";
    }

    return status === "OFFERED" ? "Offered" : "Not found";
  }

  return (
    <main
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "32px 20px",
      }}
    >
      <h1>Termwise Course Explorer</h1>

      <p>
        Search Waterloo courses and view their saved offering
        status for each term.
      </p>

      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          margin: "24px 0",
        }}
      >
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search CS 136, algorithms, mathematics..."
          aria-label="Search courses"
          style={{
            flex: "1",
            minWidth: "220px",
            padding: "12px",
            border: "1px solid #888",
            borderRadius: "6px",
          }}
        />

        <select
          value={selectedTerm}
          onChange={(event) => setSelectedTerm(event.target.value)}
          aria-label="Select academic term"
          style={{
            padding: "12px",
            border: "1px solid #888",
            borderRadius: "6px",
          }}
        >
          {TERMS.map((term) => (
            <option key={term.code} value={term.code}>
              {term.label}
            </option>
          ))}
        </select>
      </div>

      {coursesLoading && <p>Loading courses...</p>}

      {coursesError && (
        <p role="alert">Course error: {coursesError}</p>
      )}

      {offeringsLoading && (
        <p>Loading offering statuses...</p>
      )}

      {offeringsError && (
        <p role="alert">Offering error: {offeringsError}</p>
      )}

      {!coursesLoading && !coursesError && (
        <>
          <p>
            Showing {filteredCourses.length} of {courses.length} courses
          </p>

          {filteredCourses.length === 0 ? (
            <p>No courses match your search.</p>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "16px",
                marginTop: "16px",
              }}
            >
              {filteredCourses.map((course) => {
                const offering = offeringByCourseId.get(
                  course.courseId
                );

                const status = offering?.status;

                return (
                  <article
                    key={course.courseId}
                    style={{
                      border: "1px solid #888",
                      borderRadius: "8px",
                      padding: "18px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "12px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <h2 style={{ margin: "0 0 8px" }}>
                          {course.subjectCode} {course.catalogNumber}
                        </h2>

                        <h3 style={{ margin: "0 0 12px" }}>
                          {course.title}
                        </h3>
                      </div>

                      <span>
                        {statusLabel(status)}
                      </span>
                    </div>

                    {course.descriptionAbbreviated && (
                      <p>{course.descriptionAbbreviated}</p>
                    )}

                    <p>
                      <strong>Term:</strong>{" "}
                      {
                        TERMS.find(
                          (term) => term.code === selectedTerm
                        )?.label
                      }
                    </p>

                    {offering && (
                      <p>
                        <strong>Last checked:</strong>{" "}
                        {new Date(
                          offering.checkedAt
                        ).toLocaleString()}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </main>
  );
}
