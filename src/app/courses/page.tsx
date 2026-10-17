"use client";

import { useEffect, useState } from "react";
import type { Course } from "@/types/course";
import type { CourseOffering } from "@/types/course-offering";
import type { TermAvailability } from "@/lib/course-offerings-helper";

const TERMS = [
    { termCode: "1261", termName: "Winter 2026" },
    { termCode: "1265", termName: "Spring 2026" },
    { termCode: "1269", termName: "Fall 2026" },

];

function getCourseKey(course: Course) {
    return `${course.courseId}`;
}

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
    const [offeringHistory, setOfferingHistory] = useState<
        Record<string, TermAvailability[]>
    >({});
    const [historyLoading, setHistoryLoading] = useState<
        Record<string, boolean>
    >({});

    useEffect(() => {
        async function loadCourses() {
            try {
                const response = await fetch("/api/courses?term=1269");

                if (!response.ok) {
                    throw new Error("Could not load courses.");
                }

                const data: Course[] = await response.json();
                setCourses(data);
            } catch {
                setError("Failed to load courses. Please try again.");
            } finally {
                setLoading(false);
            }
        }

        loadCourses();
    }, []);

    async function loadOfferingHistory(course: Course) {
        const key = getCourseKey(course);

        // Don't fetch the same course's history repeatedly.
        if (offeringHistory[key] || historyLoading[key]) {
            return;
        }

        setHistoryLoading((previous) => ({
            ...previous,
            [key]: true,
        }));

        try {
            const results = await Promise.all(
                TERMS.map(async (term): Promise<TermAvailability> => {
                    try {
                        const params = new URLSearchParams({
                            courseId: String(course.courseId),
                            term: term.termCode,
                        });

                        const response = await fetch(
                            `/api/course-offerings?${params.toString()}`
                        );


                        if (!response.ok) {
                            return { ...term, status: "not_found" };
                        }

                        const data: CourseOffering[] = await response.json();

                        return {
                            ...term,
                            status: "offered",
                        };
                    } catch (error) {
                        return { ...term, status: "not_found" };
                    }
                })
            );

            setOfferingHistory((previous) => ({
                ...previous,
                [key]: results,
            }));
        } finally {
            setHistoryLoading((previous) => ({
                ...previous,
                [key]: false,
            }));
        }
    }

    function toggleHistory(course: Course) {
        const key = getCourseKey(course);

        if (expandedCourse === key) {
            setExpandedCourse(null);
            return;
        }

        setExpandedCourse(key);
        void loadOfferingHistory(course);
    }

    const filteredCourses = courses.filter((course) => {
        const query = search.trim().toLowerCase();

        if (!query) return true;

        const subject = course.subjectCode.toLowerCase();
        const catalog = course.catalogNumber.toLowerCase();
        const courseCode = `${subject} ${catalog}`;

        if (!query) return true;

        if (query.includes(" ")) {
            const firstSpaceIndex = query.indexOf(" ");
            const querySubject = query.substring(0, firstSpaceIndex);
            const queryCatalog = query.substring(firstSpaceIndex + 1).trim();

            return (
                subject === querySubject &&
                catalog.startsWith(queryCatalog)
            );
        }

        return courseCode.includes(query);
    });

    return (
        <main className="mx-auto max-w-5xl p-8">
            <h1 className="text-3xl font-bold">Course Explorer</h1>

            <p className="mt-2 text-gray-500">
                Explore courses offered at Waterloo.
            </p>

            <input
                className="mt-6 w-full rounded-lg border p-3"
                placeholder="Search by course code or title..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
            />

            {loading && <p className="mt-6">Loading courses...</p>}

            {error && <p className="mt-6 text-red-500">{error}</p>}

            {!loading && !error && (
                <p className="mt-4 text-sm text-gray-500">
                    {filteredCourses.length} courses found
                </p>
            )}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {filteredCourses.slice(0, 50).map((course) => {
                    const key = getCourseKey(course);
                    const isExpanded = expandedCourse === key;
                    const history = offeringHistory[key];

                    return (
                        <article
                            key={key}
                            className="rounded-xl border p-5"
                        >
                            <p className="text-sm font-medium text-blue-600">
                                {course.subjectCode} {course.catalogNumber}
                            </p>

                            <h2 className="mt-2 font-semibold">
                                {course.title}
                            </h2>

                            {course.descriptionAbbreviated && (
                                <p className="mt-2 text-sm text-gray-500">
                                    {course.descriptionAbbreviated}
                                </p>
                            )}

                            <button
                                className="mt-4 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                                onClick={() => toggleHistory(course)}
                            >
                                {isExpanded
                                    ? "Hide offering history"
                                    : "Show offering history"}
                            </button>

                            {isExpanded && (
                                <div className="mt-4 border-t pt-3">
                                    <h3 className="font-medium">
                                        Recent offering history
                                    </h3>

                                    {historyLoading[key] && (
                                        <p className="mt-2 text-sm text-gray-500">
                                            Checking terms...
                                        </p>
                                    )}

                                    {history && (
                                        <ul className="mt-2 space-y-2">
                                            {history.map((term) => (
                                                <li
                                                    key={term.termCode}
                                                    className="flex items-center justify-between gap-3 text-sm"
                                                >
                                                    <span>{term.termName}</span>

                                                    <span
                                                        className={
                                                            term.status === "offered"
                                                                ? "text-green-700"
                                                                : term.status === "not_found"
                                                                    ? "text-gray-500"
                                                                    : "text-amber-700"
                                                        }
                                                    >
                                                        {term.status === "offered"
                                                            ? "Offered"
                                                            : term.status === "not_found"
                                                                ? "No record found"
                                                                : term.status === "unknown"
                                                                    ? "Checking..."
                                                                    : "Unavailable"}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </article>
                    );
                })}
            </div>
        </main>
    );
}