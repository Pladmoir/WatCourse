import { NextResponse } from "next/server";
import { uwFetch } from "@/lib/uw-fetch";
import type { Course } from "@/types/course";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");
  const term = searchParams.get("term");

  if (
    !courseId ||
    !term ||
    !/^\d{4}$/.test(term)
  ) {
    return NextResponse.json(
      {
        error:
          "Provide valid subject, catalogNumber, and term parameters.",
      },
      { status: 400 }
    );
  }

  try {
    const courses = await uwFetch<Course[]>(
      `/ClassSchedules/${term}/${courseId}`
    );

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Course offering lookup failed:", error);

    return NextResponse.json(
      { error: "Could not retrieve course data." },
      { status: 500 }
    );
  }
}