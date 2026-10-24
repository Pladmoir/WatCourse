"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Check, CheckCircle2, CircleAlert, Search, SlidersHorizontal, Plus } from "lucide-react";
import type { Course } from "@/types/course";
import type { CourseOffering } from "@/types/course-offering";
import { usePlan } from "@/components/plan-provider";
import { OFFERING_TERMS, courseCode } from "@/lib/plan";

const card = "rounded-lg border border-[#E0E0E0] bg-white shadow-[0_4px_12px_0_rgba(0,0,0,0.04)]";
const field = "w-full rounded-md border border-[#D6D6D6] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0043CE] focus:ring-2 focus:ring-[#0043CE]/10";

function prerequisiteWarning(course: Course, completedCodes: Set<string>) {
  const text = course.requirementsDescription ?? "";
  if (!/prereq|prerequisite|requirement/i.test(text)) return null;
  const codes = [...text.matchAll(/\b([A-Z]{2,6})\s+(\d{3}[A-Z]?)\b/g)].map((m) => `${m[1]} ${m[2]}`);
  const missing = [...new Set(codes)].filter((code) => !completedCodes.has(code));
  if (!codes.length || !missing.length) return null;
  return { missing, text };
}

export default function CoursesPage() {
  const { plan, addCourse, removeCourse } = usePlan();
  const [courses, setCourses] = useState<Course[]>([]);
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("1269");
  const [loading, setLoading] = useState(true);
  const [offeringsLoading, setOfferingsLoading] = useState(false);
  const [error, setError] = useState("");
  const [offeringsError, setOfferingsError] = useState("");
  const [notice, setNotice] = useState("");
  const [onlySelected, setOnlySelected] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/courses").then((r) => { if (!r.ok) throw new Error("Couldn't load the course catalogue."); return r.json() as Promise<Course[]>; })
      .then((data) => { if (!cancelled) setCourses(data); })
      .catch((e: unknown) => { if (!cancelled) setError(e instanceof Error ? e.message : "An unexpected error occurred."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setOfferingsLoading(true); setOfferingsError("");
    fetch(`/api/course-offerings?term=${selectedTerm}`).then((r) => { if (!r.ok) throw new Error("Offering statuses are unavailable for this term."); return r.json() as Promise<CourseOffering[]>; })
      .then((data) => { if (!cancelled) setOfferings(data); })
      .catch((e: unknown) => { if (!cancelled) setOfferingsError(e instanceof Error ? e.message : "Couldn't load offering statuses."); })
      .finally(() => { if (!cancelled) setOfferingsLoading(false); });
    return () => { cancelled = true; };
  }, [selectedTerm]);

  const offeringByCourseId = useMemo(() => new Map(offerings.map((o) => [o.courseId, o])), [offerings]);
  const selectedIds = useMemo(() => new Set(plan.courses.map((c) => c.courseId)), [plan.courses]);
  const completedCodes = useMemo(() => new Set(plan.courses.filter((c) => c.status === "COMPLETED").map((c) => courseCode(c).toUpperCase())), [plan.courses]);
  const filteredCourses = useMemo(() => {
    const q = search.trim().toLowerCase();
    return courses.filter((c) => (!onlySelected || selectedIds.has(c.courseId)) && (!q || `${c.subjectCode} ${c.catalogNumber} ?? ""}`.toLowerCase().includes(q)));
  }, [courses, search, onlySelected, selectedIds]);

  function toggleCourse(course: Course) {
    if (selectedIds.has(course.courseId)) {
      removeCourse(course.courseId); setNotice(`${courseCode(course)} removed from your roadmap.`); return;
    }
    const warning = prerequisiteWarning(course, completedCodes);
    if (warning) {
      const ok = window.confirm(`Possible prerequisite warning\n\nYour completed courses don't currently include: ${warning.missing.join(", ")}.\n\nCatalogue requirements: ${warning.text}\n\nAdd ${courseCode(course)} anyway? This is an advisory check and may not understand alternative prerequisite rules.`);
      if (!ok) return;
    }
    const result = addCourse(course, selectedTerm);
    setNotice(result.added ? `${courseCode(course)} selected and added to your roadmap.` : result.reason ?? "Couldn't add this course.");
  }

  return <div className="flex flex-col gap-6">
    <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[1.2px] text-[#828282]"><span className="h-0.5 w-5 bg-[#0043CE]" /> Discover what's next</div><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Course Search</h1><p className="mt-2 text-base text-[#828282]">Search the Waterloo catalogue and click any course card to select or deselect it.</p></div><Link href="/roadmap" className="inline-flex items-center justify-center gap-2 self-start rounded-md bg-[#0043CE] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0036A8] sm:self-auto">View roadmap <ArrowRight size={16} /></Link></section>

    <section className={`${card} flex flex-col gap-3 p-4 md:flex-row md:items-center`}>
      <div className="relative flex-1"><Search size={18} className="absolute left-3 top-3 text-[#828282]" /><input className={`${field} pl-10`} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search course code, title, or requirements…" aria-label="Search courses" /></div>
      <div className="flex items-center gap-2 md:w-56"><label htmlFor="offering-term" className="shrink-0 text-xs font-semibold text-[#828282]">Offering term</label><select id="offering-term" className={field} value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)}>{OFFERING_TERMS.map((t) => <option key={t.code} value={t.code}>{t.label}</option>)}</select></div>
      <button onClick={() => setOnlySelected((v) => !v)} className={`inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2.5 text-sm font-semibold ${onlySelected ? "border-[#B8C9FF] bg-[#F0F4FF] text-[#0043CE]" : "border-[#D6D6D6] hover:bg-[#F7F7F7]"}`}><SlidersHorizontal size={16} />{onlySelected ? "Selected only" : "All courses"}</button>
    </section>

    <div className="flex flex-wrap items-center justify-between gap-2 text-sm"><p><strong>{filteredCourses.length.toLocaleString()}</strong> courses <span className="text-[#828282]">in catalogue{offeringsLoading ? " · checking availability…" : ""}</span></p><p className="inline-flex items-center gap-2 font-semibold text-[#0043CE]"><CheckCircle2 size={16} /> {plan.courses.length} selected <span className="text-[#828282]">·</span> {plan.courses.filter((c) => c.status === "COMPLETED").length} completed</p></div>
    {notice && <div role="status" className="flex items-start gap-2 rounded-md border border-[#D6E2FF] bg-[#F5F8FF] px-4 py-3 text-sm text-[#3457A3]"><CheckCircle2 size={17} className="mt-0.5 shrink-0" /><span className="flex-1">{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss message">×</button></div>}
    {error && <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
    {offeringsError && <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"><CircleAlert size={16} />{offeringsError} You can still browse courses; availability may be unknown.</div>}
    {loading ? <div className={`${card} p-8 text-sm text-[#828282]`}>Loading Waterloo courses…</div> : filteredCourses.length === 0 ? <div className={`${card} flex flex-col items-center p-12 text-center`}><Search size={28} className="text-[#828282]" /><h2 className="mt-4 text-xl font-bold">No courses found</h2><p className="mt-2 text-sm text-[#828282]">Try another search or turn off the selected-only filter.</p><button className="mt-4 rounded-md border border-[#D6D6D6] px-4 py-2 text-sm font-semibold" onClick={() => { setSearch(""); setOnlySelected(false); }}>Clear filters</button></div> : <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Course results">
      {filteredCourses.slice(0, 180).map((course) => {
        const selected = selectedIds.has(course.courseId);
        const planned = plan.courses.find((c) => c.courseId === course.courseId);
        const offering = offeringByCourseId.get(course.courseId);
        const status = offering?.status === "OFFERED" ? "offered" : offering?.status === "NOT_FOUND" ? "not-found" : "unknown";
        const requirements = course.requirementsDescription?.trim();
        return <button type="button" key={course.courseId} aria-pressed={selected} onClick={() => toggleCourse(course)} className={`group flex min-h-[250px] flex-col rounded-lg border bg-white p-4 text-left shadow-[0_4px_12px_0_rgba(0,0,0,0.04)] transition hover:-translate-y-0.5 hover:shadow-md ${selected ? "border-[#8EA9EE] bg-[#F9FAFF] ring-1 ring-[#D9E4FF]" : "border-[#E0E0E0] hover:border-[#B8C9FF]"}`}>
          <div className="flex items-center justify-between gap-3"><span className="rounded-md bg-[#F0F4FF] px-2.5 py-1.5 text-xs font-bold text-[#0043CE]">{courseCode(course)}</span><span className={`flex size-7 items-center justify-center rounded-md border ${selected ? "border-[#0043CE] bg-[#0043CE] text-white" : "border-[#D6D6D6] text-[#828282] group-hover:border-[#0043CE]"}`}>{selected ? <Check size={16} /> : <span className="text-lg leading-none">+</span>}</span></div>
          <h2 className="mt-4 text-base font-bold leading-6">{course.title || "Course title unavailable"}</h2><p className="mt-2 line-clamp-3 text-sm leading-6 text-[#626262]">{course.descriptionAbbreviated || "No short description is available for this course."}</p>
          <div className="mt-auto flex items-center justify-between gap-2 pt-4"><span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${status === "offered" ? "text-[#1BA709]" : status === "not-found" ? "text-[#9A6418]" : "text-[#828282]"}`}><span className={`size-1.5 rounded-full ${status === "offered" ? "bg-[#1BA709]" : status === "not-found" ? "bg-[#D8A044]" : "bg-[#A7B0BD]"}`} />{status === "offered" ? "Offered" : status === "not-found" ? "No record found" : "Availability unknown"}</span><span className="text-xs text-[#828282]">0.5 units</span></div>
          {planned && <div className={`mt-3 flex items-center gap-1.5 text-xs font-semibold ${planned.status === "COMPLETED" ? "text-[#1BA709]" : planned.status === "IN_PROGRESS" ? "text-[#0043CE]" : "text-[#828282]"}`}>{planned.status === "COMPLETED" ? <CheckCircle2 size={14} /> : planned.status === "IN_PROGRESS" ? <CircleAlert size={14} /> : <BookOpen size={14} />}{planned.status === "COMPLETED" ? "Completed" : planned.status === "IN_PROGRESS" ? "In progress" : "Planned in roadmap"}</div>}
          {requirements && <div className="mt-3 border-t border-[#E0E0E0] pt-3"><p className="flex items-center gap-1.5 text-xs font-semibold text-[#828282]"><BookOpen size={13} /> Requirements</p><p className="mt-1 line-clamp-3 text-xs leading-5 text-[#626262]">{requirements}</p></div>}
          <div className={`-mx-4 -mb-4 mt-4 flex items-center gap-2 border-t px-4 py-3 text-xs font-semibold ${selected ? "border-[#D9E4FF] bg-[#F0F4FF] text-[#0043CE]" : "border-[#E0E0E0] bg-[#FAFAFA] text-[#626262]"}`}>{selected ? <><CheckCircle2 size={15} /> Selected · click to remove</> : <><Plus size={15} /> Click to add to roadmap</>}</div>
        </button>;
      })}
    </section>}
    {!loading && filteredCourses.length > 180 && <p className="text-sm text-[#828282]">Showing the first 180 matching courses. Refine your search to narrow the results.</p>}
    <section className={`${card} flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center`}><div><h2 className="font-bold">Your choices follow you across WatCourse.</h2><p className="mt-1 text-sm text-[#828282]">Selections are saved in this browser and reflected in your roadmap and analytics.</p></div><Link href="/roadmap" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-[#0043CE] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0036A8]">Organize your courses <ArrowRight size={16} /></Link></section>
  </div>;
}
