
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  ChartNoAxesColumn,
  GraduationCap,
} from "lucide-react";
import type { ReactNode } from "react";
import { usePlan } from "@/components/plan-provider";

const navigation = [
  { href: "/", label: "Analytics", icon: ChartNoAxesColumn },
  { href: "/roadmap", label: "Roadmap", icon: CalendarDays },
  { href: "/courses", label: "Course Search", icon: BookOpen },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { plan } = usePlan();

  return (
    <div className="min-h-screen w-full bg-white font-sans text-black">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#E0E0E0] bg-white">
        <div className="mx-auto flex min-h-16 max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-10 lg:px-20">
          {/* Brand */}
          <Link
            href="/"
            aria-label="WatCourse home"
            className="flex shrink-0 items-center gap-2 text-xl font-semibold tracking-[-0.5px] text-black"
          >
            <GraduationCap size={25} strokeWidth={1.9} />
            <span>
              WatCourse<span className="text-[#0043CE]"></span>
            </span>
          </Link>

          {/* Navigation */}
          <nav
            className="flex flex-wrap items-center gap-1"
            aria-label="Main navigation"
          >
            {navigation.map(({ href, label, icon: Icon }) => {
              const active =
                pathname === href ||
                (href === "/courses" && pathname.startsWith("/courses"));

              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-[#F7F7F7] text-black"
                      : "text-[#828282] hover:bg-[#F7F7F7] hover:text-black"
                  }`}
                >
                  <Icon size={17} strokeWidth={1.8} />
                  <span>{label}</span>

                  {href === "/roadmap" && plan.courses.length > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E8EEFF] px-1.5 text-xs font-semibold text-[#0043CE]">
                      {plan.courses.length}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Save status */}
          <div className="flex items-center gap-2 text-xs font-medium text-[#828282]">
            <span className="size-2 rounded-full bg-[#1BA709]" />
            <span>Saved in this browser</span>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto min-h-[calc(100vh-145px)] w-full max-w-[1440px] px-4 py-8 sm:px-10 lg:px-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E0E0E0] bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-5 text-sm text-[#828282] sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-20">
          <Link
            href="/"
            className="font-semibold tracking-[-0.2px] text-black"
          >
            WatCourse<span className="text-[#0043CE]"></span>
          </Link>

          <p>Plan your degree, one term at a time.</p>

          <div className="flex items-center gap-2">
            <CalendarDays size={15} strokeWidth={1.8} />
            <span>Academic roadmap · 2026–2031</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
