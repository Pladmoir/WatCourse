import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

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

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const termCode = process.argv[2];

  if (!termCode || !/^\d{4}$/.test(termCode)) {
    throw new Error(
      "Provide a four-digit term code, e.g. 1269."
    );
  }

  // Load all courses already stored in our database.
  const courses = await prisma.course.findMany({
    select: {
      courseId: true,
      subjectCode: true,
      catalogNumber: true,
    },
  });

  console.log(
    `Checking ${courses.length} courses for term ${termCode}...`
  );

  let offered = 0;
  let notFound = 0;
  let errors = 0;

  for (const course of courses) {
    const url =
      `https://openapi.data.uwaterloo.ca/v3/ClassSchedules/` +
      `${termCode}/${encodeURIComponent(course.courseId)}`;

    try {
      let response: Response | undefined;

      // Retry rate-limit responses instead of misclassifying them.
      for (let attempt = 0; attempt < 4; attempt++) {
        response = await fetch(url, {
          headers: {
            "X-API-KEY": apiKey || "",
          },
        });

        if (response.status !== 429) {
          break;
        }

        if (attempt < 3) {
          console.warn(
            `Rate limited; retrying ${course.subjectCode} ` +
            `${course.catalogNumber}...`
          );
          await delay(2000 * (attempt + 1));
        }
      }

      if (!response) {
        errors++;
        continue;
      }

      let status: "OFFERED" | "NOT_FOUND";

      if (response.ok) {
        // A successful API request means the course is offered.
        status = "OFFERED";
      } else if (response.status === 404) {
        // A 404 means no schedule was found at this endpoint.
        status = "NOT_FOUND";
      } else {
        // Do not treat authentication, rate-limit, or server
        // errors as proof that a course is not offered.
        errors++;
        console.error(
          `Skipped ${course.subjectCode} ${course.catalogNumber}: ` +
          `HTTP ${response.status}`
        );
        continue;
      }

      await prisma.courseOffering.upsert({
        where: {
          courseId_termCode: {
            courseId: course.courseId,
            termCode,
          },
        },
        create: {
          courseId: course.courseId,
          termCode,
          status,
        },
        update: {
          status,
          checkedAt: new Date(),
        },
      });

      if (status === "OFFERED") {
        offered++;
      } else {
        notFound++;
      }

      if ((offered + notFound) % 25 === 0) {
        console.log(
          `Checked ${offered + notFound}/${courses.length} courses...`
        );
      }

      // Keep requests spaced out to reduce rate-limit issues.
      await delay(150);
    } catch (error) {
      errors++;
      console.error(
        `Failed to check ${course.subjectCode} ${course.catalogNumber}:`,
        error
      );
    }
  }

  console.log("\nCourse offering sync complete.");
  console.log(`Offered: ${offered}`);
  console.log(`Not found: ${notFound}`);
  console.log(`Errors/skipped: ${errors}`);
}

main()
  .catch((error) => {
    console.error("Course offering sync failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });