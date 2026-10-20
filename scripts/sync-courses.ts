import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import type { Course } from "../src/types/course";

const apiKey = process.env.UW_OPEN_DATA_API_KEY;
const connectionString = process.env.DATABASE_URL;

if (!apiKey) {
  throw new Error("UW_OPEN_DATA_API_KEY is not configured.");
}

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const term = process.argv[2] ?? "1269";

  if (!/^\d{4}$/.test(term)) {
    throw new Error("Term must be a four-digit code.");
  }

  const response = await fetch(
    `https://openapi.data.uwaterloo.ca/v3/Courses/${term}`,
    {
      headers: {
        "X-API-KEY": process.env.UW_OPEN_DATA_API_KEY || ""
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Waterloo API returned ${response.status}: ${response.statusText}`
    );
  }

  const courses = (await response.json()) as Course[];

  console.log(`Received ${courses.length} courses for term ${term}.`);

  let saved = 0;

  for (const course of courses) {
    await prisma.course.upsert({
      where: {
        courseId: course.courseId,
      },

      create: {
        courseId: course.courseId,
        subjectCode: course.subjectCode,
        catalogNumber: course.catalogNumber,
        title: course.title,
        descriptionAbbreviated: course.descriptionAbbreviated,
        description: course.description,
        associatedAcademicCareer: course.associatedAcademicCareer,
        associatedAcademicGroupCode:
          course.associatedAcademicGroupCode,
        associatedAcademicOrgCode:
          course.associatedAcademicOrgCode,
        gradingBasis: course.gradingBasis,
        courseComponentCode: course.courseComponentCode,
        enrollConsentCode: course.enrollConsentCode,
        enrollConsentDescription: course.enrollConsentDescription,
        dropConsentCode: course.dropConsentCode,
        dropConsentDescription: course.dropConsentDescription,
        requirementsDescription:
          course.requirementsDescription ?? null,
      },

      update: {
        subjectCode: course.subjectCode,
        catalogNumber: course.catalogNumber,
        title: course.title,
        descriptionAbbreviated: course.descriptionAbbreviated,
        description: course.description,
        associatedAcademicCareer: course.associatedAcademicCareer,
        associatedAcademicGroupCode:
          course.associatedAcademicGroupCode,
        associatedAcademicOrgCode:
          course.associatedAcademicOrgCode,
        gradingBasis: course.gradingBasis,
        courseComponentCode: course.courseComponentCode,
        enrollConsentCode: course.enrollConsentCode,
        enrollConsentDescription: course.enrollConsentDescription,
        dropConsentCode: course.dropConsentCode,
        dropConsentDescription: course.dropConsentDescription,
        requirementsDescription:
          course.requirementsDescription ?? null,
      },
    });

    saved++;

    if (saved % 100 === 0) {
      console.log(`Saved ${saved}/${courses.length} courses.`);
    }
  }

  console.log(`Finished. Saved ${saved} courses.`);
}

main()
  .catch((error) => {
    console.error("Course sync failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });