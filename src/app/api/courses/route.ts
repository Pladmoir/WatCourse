import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const courses = await prisma.course.findMany({
        orderBy: [
            {subjectCode: "asc"},
            {catalogNumber: "asc"}
        ]
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Failed to fetch courses:", error);

    return NextResponse.json(
      { error: "Failed to fetch Waterloo courses." },
      { status: 500 }
    );
  }
}