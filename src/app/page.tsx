"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, CheckCircle2, GraduationCap, ChartNoAxesColumn, CircleAlert } from "lucide-react";
import { usePlan } from "@/components/plan-provider";

const UNIT_GOAL = 20;
const COURSE_UNITS = 0.5;
const card = "rounded-lg border border-[#E0E0E0] bg-white shadow-[0_4px_12px_0_rgba(0,0,0,0.04)]";
const stats = [
  { label: "Semesters", valueKey: "semesters" },
  { label: "Total Courses", valueKey: "total" },
  { label: "Completed", valueKey: "completed" },
  { label: "In Progress", valueKey: "progress" },
];
function fmt(n: number) { return Number.isInteger(n) ? `${n}` : n.toFixed(1); }

export default function AnalyticsPage() {
  const { plan, hydrated } = usePlan();
  const completedCount = plan.courses.filter((c) => c.status === "COMPLETED").length;
  const inProgressCount = plan.courses.filter((c) => c.status === "IN_PROGRESS").length;
  const plannedCount = plan.courses.filter((c) => c.status === "PLANNED").length;
  const completedUnits = completedCount * COURSE_UNITS;
  const plannedUnits = (plannedCount + inProgressCount) * COURSE_UNITS;
  const remainingUnits = Math.max(0, UNIT_GOAL - completedUnits);
  const progress = Math.min(100, (completedUnits / UNIT_GOAL) * 100);
  const semesters = new Set(plan.courses.map((c) => c.roadmapTermId).filter(Boolean)).size;
  const total = plan.courses.length;
  const statusTotal = Math.max(1, total);
  const values: Record<string, number> = { semesters, total, completed: completedCount, progress: inProgressCount };
  const statuses = [
    { label: "Completed", count: completedCount, color: "bg-[#1BA709]", text: "text-[#1BA709]" },
    { label: "In Progress", count: inProgressCount, color: "bg-[#0043CE]", text: "text-[#0043CE]" },
    { label: "Planned", count: plannedCount, color: "bg-[#828282]", text: "text-[#626262]" },
  ];
  return <div className="flex flex-col gap-6">
    <section className={`${card} flex flex-col gap-6 p-[18px]`}>
      <div>
        <div className="flex items-center gap-[11px]"><GraduationCap className="size-[27px] text-[#0043CE]" /><h1 className="text-2xl font-bold leading-[150%]">Academic Overview</h1></div>
        <p className="mt-2 text-base font-medium tracking-[-0.32px] text-[#828282]">Key statistics about your degree progress</p>
      </div>
      <div className="flex w-full max-w-[337px] items-center gap-1 self-start rounded-lg bg-[#F7F7F7] p-1">
        <span className="rounded bg-white px-3 py-2 text-sm font-medium shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">Analytics</span>
        <Link href="/roadmap" className="rounded px-3 py-2 text-sm font-medium text-[#626262] hover:bg-white">Roadmap</Link>
        <Link href="/courses" className="rounded px-3 py-2 text-sm font-medium text-[#626262] hover:bg-white">Course Search</Link>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => <div key={s.label} className={`${card} flex flex-col p-5 text-center`}>
          <div className={`text-2xl font-bold leading-[150%] ${s.valueKey === "completed" ? "text-[#1BA709]" : s.valueKey === "progress" ? "text-[#0043CE]" : "text-black"}`}>{hydrated ? values[s.valueKey] : "—"}</div>
          <div className="text-sm font-semibold text-[#828282]">{s.label}</div>
        </div>)}
      </div>
      <div className="grid gap-4 lg:grid-cols-3 lg:gap-8">
        <div className={`${card} flex min-h-[172px] flex-col gap-4 p-6`}>
          <h2 className="text-2xl font-bold leading-[150%]">Progress</h2>
          <p className="text-xl font-medium tracking-[-0.4px]">{fmt(completedUnits)} / {UNIT_GOAL} units · {Math.round(progress)}%</p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#E0E0E0]"><div className="h-full rounded-full bg-[#0043CE] transition-all" style={{ width: `${progress}%` }} /></div>
          <p className="text-sm text-[#828282]">{completedCount} completed courses · 0.5 units each</p>
        </div>
        <div className={`${card} flex min-h-[172px] flex-col gap-5 p-6`}>
          <h2 className="text-2xl font-bold leading-[150%]">Expected Graduation</h2>
          <div className="flex items-center gap-2"><CalendarDays className="size-[27px] text-[#0043CE]" /><span className="text-xl font-semibold tracking-[-0.4px]">{plan.courses.length ? "Based on your roadmap" : "Not set yet"}</span></div>
          <p className="text-sm text-[#828282]">Add courses to begin mapping your degree timeline.</p>
        </div>
        <div className={`${card} flex min-h-[172px] flex-col justify-between p-6`}>
          <h2 className="text-2xl font-bold leading-[150%]">Remaining</h2>
          <p className="text-3xl font-bold tracking-[-0.4px]">{hydrated ? fmt(remainingUnits) : "—"}</p>
          <p className="text-base font-medium text-[#828282]">Units to complete · {fmt(plannedUnits)} additional units planned/in progress</p>
        </div>
      </div>
    </section>
    <section className={`${card} p-6`}>
      <div className="flex items-center gap-4"><ChartNoAxesColumn className="size-[27px] text-[#0043CE]" /><h2 className="text-2xl font-bold leading-[150%]">Courses Status Breakdown</h2></div>
      <div className="mt-4 text-sm font-semibold text-[#828282]">Status</div>
      <div className="mt-1">{statuses.map((s) => <div key={s.label} className="flex min-h-12 flex-wrap items-center gap-4 border-t border-[#E0E0E0] py-2">
        <span className="flex-1 text-lg font-medium">{s.label}</span>
        <div className="flex w-full max-w-[452px] items-center gap-3 text-base text-[#828282] sm:w-[60%]"><span className={`w-6 text-right ${s.text}`}>{s.count}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-[#E0E0E0]"><div className={`h-full rounded-full ${s.color}`} style={{ width: `${(s.count / statusTotal) * 100}%` }} /></div><span className="w-12 text-right">{Math.round((s.count / statusTotal) * 100)}%</span></div>
      </div>)}</div>
      {total === 0 && <p className="mt-3 text-sm text-[#828282]">Add your first course to start tracking progress.</p>}
    </section>
    <section className="grid gap-4 lg:grid-cols-2">
      <div className={`${card} flex flex-col gap-3 p-6`}><div className="flex items-center gap-3"><BookOpen className="text-[#0043CE]" /><h2 className="text-xl font-bold">Make your plan concrete</h2></div><p className="text-sm leading-6 text-[#626262]">Find courses, choose an offering term, and add them to your roadmap. Your analytics update automatically.</p><div className="flex flex-wrap gap-3"><Link href="/courses" className="inline-flex items-center gap-2 rounded-md bg-[#0043CE] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0036A8]">Explore courses <ArrowRight size={16} /></Link><Link href="/roadmap" className="inline-flex items-center gap-2 rounded-md border border-[#E0E0E0] px-4 py-2.5 text-sm font-semibold hover:bg-[#F7F7F7]">View roadmap</Link></div></div>
      <div className={`${card} flex gap-4 p-6`}><div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F0F4FF] text-[#0043CE]"><CircleAlert size={20} /></div><div><h2 className="text-xl font-bold">One course, half a unit.</h2><p className="mt-2 text-sm leading-6 text-[#626262]">Your degree target is 20 units. Mark a course completed when you finish it; planned courses are tracked separately and do not count toward completed progress.</p></div></div>
    </section>
  </div>;
}
