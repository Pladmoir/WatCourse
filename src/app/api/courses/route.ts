import { NextResponse } from "next/server";
import { uwFetch } from "@/lib/uw-fetch";
import type { Course } from "@/types/course";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const term = searchParams.get("term") ?? "1269";

    if (!/^\d{4}$/.test(term)) {
      return NextResponse.json(
        { error: "Term must be a four-digit code." },
        { status: 400 }
      );
    }

    const courses = await uwFetch<unknown[]>(
      `/Courses/${term}`
    );

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Failed to fetch courses:", error);

    return NextResponse.json(
      { error: "Failed to fetch Waterloo courses." },
      { status: 500 }
    );
  }
}