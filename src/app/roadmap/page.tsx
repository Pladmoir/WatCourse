"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, BriefcaseBusiness, CalendarDays, Check, CircleAlert, Coffee, Plus, Search, Trash2 } from "lucide-react";
import { usePlan } from "@/components/plan-provider";
import { OFFERING_TERMS, ROADMAP_TERMS, courseCode, coursesInTerm, termKind, type TermKind } from "@/lib/plan";
import type { Course } from "@/types/course";

const card = "rounded-lg border border-[#E0E0E0] bg-white shadow-[0_4px_12px_0_rgba(0,0,0,0.04)]";
const field = "w-full rounded-md border border-[#D6D6D6] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0043CE] focus:ring-2 focus:ring-[#0043CE]/10";

export default function RoadmapPage() {
  const { plan, hydrated, addCourse, removeCourse, setCourseStatus, moveCourse, setTermKind } = usePlan();
  const [catalogue, setCatalogue] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [offeringTerm, setOfferingTerm] = useState("1269");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/courses").then((r) => { if (!r.ok) throw new Error("Couldn't load the course catalogue."); return r.json() as Promise<Course[]>; })
      .then((data) => { if (!cancelled) setCatalogue(data); })
      .catch((e: unknown) => { if (!cancelled) setError(e instanceof Error ? e.message : "Course catalogue unavailable."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return catalogue.filter((c) => `${c.subjectCode} ${c.catalogNumber}`.toLowerCase().includes(q)).slice(0, 8);
  }, [catalogue, search]);
  const completedCount = plan.courses.filter((c) => c.status === "COMPLETED").length;
  const inProgressCount = plan.courses.filter((c) => c.status === "IN_PROGRESS").length;
  const plannedCount = plan.courses.filter((c) => c.status === "PLANNED").length;

  function changeKind(termId: string, kind: TermKind) {
    const result = setTermKind(termId, kind);
    setNotice(result.changed ? "Term type updated." : result.reason ?? "Couldn't update term.");
  }
  function add(course: Course) {
    const result = addCourse(course, offeringTerm);
    setNotice(result.added ? `${courseCode(course)} added to your roadmap.` : result.reason ?? "Course wasn't added.");
    if (result.added) setSearch("");
  }

  return <div className="flex flex-col gap-6">
    <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[1.2px] text-[#828282]"><span className="h-0.5 w-5 bg-[#0043CE]" /> Your degree, mapped out</div><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Degree Roadmap</h1><p className="mt-2 text-base text-[#828282]">Plan your Fall, Winter, and Spring terms across five academic years.</p></div>
      <Link href="/courses" className="inline-flex items-center justify-center gap-2 self-start rounded-md bg-[#0043CE] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0036A8] sm:self-auto">Course Search <ArrowRight size={16} /></Link>
    </section>

    <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {[{ label: "Courses in plan", value: plan.courses.length, note: `${new Set(plan.courses.map((c) => c.roadmapTermId).filter(Boolean)).size} terms with courses` }, { label: "Completed", value: `${(completedCount * 0.5).toFixed(1)} units`, note: `${completedCount} courses completed` }, { label: "Planned / in progress", value: `${((plannedCount + inProgressCount) * 0.5).toFixed(1)} units`, note: `${plannedCount + inProgressCount} courses in the pipeline` }].map((s) => <div className={`${card} p-5`} key={s.label}><p className="text-sm font-semibold text-[#828282]">{s.label}</p><p className="mt-2 text-2xl font-bold">{s.value}</p><p className="mt-1 text-xs text-[#828282]">{s.note}</p></div>)}
    </section>

    {notice && <div role="status" className="flex items-start gap-2 rounded-md border border-[#D6E2FF] bg-[#F5F8FF] px-4 py-3 text-sm text-[#3457A3]"><Check size={17} className="mt-0.5 shrink-0" /><span className="flex-1">{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss message">×</button></div>}

    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex flex-col gap-7">
        {!hydrated && <div className={`${card} p-4 text-sm text-[#828282]`}>Loading your saved roadmap…</div>}
        {Array.from({ length: 5 }, (_, i) => i + 1).map((yearGroup) => {
          const terms = ROADMAP_TERMS.filter((t) => t.yearGroup === yearGroup);
          const count = terms.reduce((sum, term) => sum + coursesInTerm(plan, term.id).length, 0);
          return <section key={yearGroup}>
            <div className="mb-3 flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-full bg-[#F0F4FF] text-sm font-bold text-[#0043CE]">0{yearGroup}</div><div className="flex-1"><h2 className="text-lg font-bold">Year {yearGroup}</h2><p className="text-xs text-[#828282]">{terms[0]?.label} – {terms[2]?.label}</p></div><span className="text-xs font-medium text-[#828282]">{count} courses</span></div>
            <div className="grid gap-4 lg:grid-cols-3">
              {terms.map((term) => {
                const kind = termKind(plan, term.id);
                const items = coursesInTerm(plan, term.id);
                return <article key={term.id} className={`${card} flex min-w-0 flex-col overflow-hidden`}>
                  <div className="flex items-start justify-between gap-2 border-b border-[#E0E0E0] p-4"><div><p className="text-sm font-semibold text-[#828282]">{term.season}</p><h3 className="text-xl font-bold">{term.year}</h3></div><span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${kind === "WORK" ? "bg-[#FFF4E5] text-[#9A6418]" : kind === "OFF" ? "bg-[#F2F2F2] text-[#626262]" : "bg-[#F0F4FF] text-[#0043CE]"}`}>{kind === "WORK" ? <BriefcaseBusiness size={12} /> : kind === "OFF" ? <Coffee size={12} /> : <BookOpen size={12} />}{kind === "WORK" ? "Work" : kind === "OFF" ? "Off" : "Study"}</span></div>
                  <div className="p-3"><label className="mb-1.5 block text-xs font-semibold text-[#828282]" htmlFor={`kind-${term.id}`}>Term type</label><select id={`kind-${term.id}`} className={field} value={kind} onChange={(e) => changeKind(term.id, e.target.value as TermKind)}><option value="STUDY">Study term</option><option value="WORK">Work term (max 2 courses)</option><option value="OFF">Off term</option></select></div>
                  {kind === "WORK" && <p className="px-4 pb-2 text-xs text-[#9A6418]">{items.length}/2 course limit used</p>}
                  <div className="flex flex-1 flex-col gap-2 px-3 pb-3">
                    {kind === "OFF" ? <div className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-md bg-[#F7F7F7] p-3 text-center text-xs text-[#828282]"><Coffee size={18} /> Time away from classes</div> : items.length ? items.map((course) => <div key={course.courseId} className="rounded-md border border-[#E0E0E0] p-3">
                      <div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="text-xs font-bold text-[#0043CE]">{courseCode(course)}</p><p className="mt-1 line-clamp-2 text-sm font-medium">{course.title}</p></div><button title={`Remove ${courseCode(course)}`} aria-label={`Remove ${courseCode(course)}`} className="rounded p-1 text-[#828282] hover:bg-[#FFF0F0] hover:text-red-600" onClick={() => { removeCourse(course.courseId); setNotice(`${courseCode(course)} removed from your roadmap.`); }}><Trash2 size={14} /></button></div>
                      <div className="mt-3 grid grid-cols-1 gap-2"><select aria-label={`Status for ${courseCode(course)}`} className={`${field} py-2 text-xs`} value={course.status} onChange={(e) => setCourseStatus(course.courseId, e.target.value as "PLANNED" | "IN_PROGRESS" | "COMPLETED")}><option value="PLANNED">Planned</option><option value="IN_PROGRESS">In progress</option><option value="COMPLETED">Completed</option></select><select aria-label={`Move ${courseCode(course)}`} className={`${field} py-2 text-xs`} value={course.roadmapTermId ?? ""} onChange={(e) => { const result = moveCourse(course.courseId, e.target.value || null); setNotice(result.moved ? `${courseCode(course)} moved.` : result.reason ?? "Couldn't move course."); }}><option value="">Unassigned</option>{ROADMAP_TERMS.filter((target) => termKind(plan, target.id) !== "OFF" && (termKind(plan, target.id) !== "WORK" || coursesInTerm(plan, target.id).length < 2 || target.id === term.id)).map((target) => <option key={target.id} value={target.id}>{target.label}</option>)}</select></div>
                    </div>) : <div className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-[#D6D6D6] p-3 text-center text-xs text-[#828282]"><Plus size={17} /> No courses planned yet</div>}
                  </div>
                  {kind !== "OFF" && <div className="flex justify-between border-t border-[#E0E0E0] px-4 py-3 text-xs text-[#828282]"><span>{items.length} {items.length === 1 ? "course" : "courses"}</span><span>{(items.length * 0.5).toFixed(1)} units</span></div>}
                </article>;
              })}
            </div>
          </section>;
        })}
      </div>

      <aside className={`${card} p-5 xl:sticky xl:top-24`}>
        <div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-md bg-[#F0F4FF] text-[#0043CE]"><Plus size={19} /></div><h2 className="text-xl font-bold">Add a course</h2></div>
        <p className="mt-2 text-sm leading-6 text-[#828282]">Search the Waterloo catalogue, then add a course to your roadmap.</p>
        <p className="mt-3 rounded-md bg-[#F7F7F7] p-3 text-xs leading-5 text-[#626262]">Offering checks currently reflect synced 2026 terms. Future roadmap placements are plans, not confirmed offerings.</p>
        <label htmlFor="course-search" className="mb-1.5 mt-5 block text-sm font-semibold">Search courses</label><div className="relative"><Search size={17} className="absolute left-3 top-3 text-[#828282]" /><input id="course-search" className={`${field} pl-9`} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Try CS 246 or algorithms" /></div>
        <label htmlFor="offering-version" className="mb-1.5 mt-4 block text-sm font-semibold">Offering version</label><select id="offering-version" className={field} value={offeringTerm} onChange={(e) => setOfferingTerm(e.target.value)}>{OFFERING_TERMS.map((t) => <option key={t.code} value={t.code}>{t.label}</option>)}</select>
        {loading && <p className="mt-4 text-sm text-[#828282]">Loading catalogue…</p>}{error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
        {search.trim() && <div className="mt-3 divide-y divide-[#E0E0E0] rounded-md border border-[#E0E0E0]">{results.length ? results.map((course) => { const exists = plan.courses.some((c) => c.courseId === course.courseId); return <div key={course.courseId} className="flex items-center gap-3 p-3"><div className="min-w-0 flex-1"><p className="text-xs font-bold text-[#0043CE]">{courseCode(course)}</p><p className="truncate text-sm">{course.title}</p></div><button disabled={exists} onClick={() => add(course)} className={`inline-flex shrink-0 items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-semibold disabled:cursor-default ${exists ? "border-[#D7EEDD] bg-[#F0FAF3] text-[#1BA709]" : "border-[#D6D6D6] hover:bg-[#F7F7F7]"}`}>{exists ? <Check size={13} /> : <Plus size={13} />}{exists ? "Added" : "Add"}</button></div>; }) : !loading && <p className="p-3 text-sm text-[#828282]">No courses found.</p>}</div>}
        <Link href="/courses" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#0043CE] hover:underline">Open full course search <ArrowRight size={15} /></Link>
      </aside>
    </div>
  </div>;
}
