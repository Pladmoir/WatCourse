import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_TERMS = ["1261", "1265", "1269"];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const termCode = searchParams.get("term");

    if (!termCode || !VALID_TERMS.includes(termCode)) {
      return NextResponse.json(
        {
          error: "Invalid term. Use 1261, 1265, or 1269.",
        },
        { status: 400 }
      );
    }

    const offerings = await prisma.courseOffering.findMany({
      where: {
        termCode,
      },
      include: {
        course: true,
      },
      orderBy: [
        { course: { subjectCode: "asc" } },
        { course: { catalogNumber: "asc" } },
      ],
    });

    return NextResponse.json(
      offerings.map((offering) => ({
        courseId: offering.courseId,
        subjectCode: offering.course.subjectCode,
        catalogNumber: offering.course.catalogNumber,
        title: offering.course.title,
        termCode: offering.termCode,
        status: offering.status,
        checkedAt: offering.checkedAt,
      }))
    );
  } catch (error) {
    console.error("Failed to fetch course offerings:", error);

    return NextResponse.json(
      { error: "Failed to fetch course offerings." },
      { status: 500 }
    );
  }
}