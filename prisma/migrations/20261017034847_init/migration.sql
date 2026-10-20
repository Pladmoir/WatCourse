-- CreateTable
CREATE TABLE "Course" (
    "id" SERIAL NOT NULL,
    "courseId" TEXT NOT NULL,
    "subjectCode" TEXT NOT NULL,
    "catalogNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "descriptionAbbreviated" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "associatedAcademicCareer" TEXT NOT NULL,
    "associatedAcademicGroupCode" TEXT NOT NULL,
    "associatedAcademicOrgCode" TEXT NOT NULL,
    "gradingBasis" TEXT NOT NULL,
    "courseComponentCode" TEXT NOT NULL,
    "enrollConsentCode" TEXT NOT NULL,
    "enrollConsentDescription" TEXT NOT NULL,
    "dropConsentCode" TEXT NOT NULL,
    "dropConsentDescription" TEXT NOT NULL,
    "requirementsDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseOffering" (
    "id" SERIAL NOT NULL,
    "courseId" TEXT NOT NULL,
    "courseOfferNumber" INTEGER NOT NULL,
    "termCode" TEXT NOT NULL,
    "termName" TEXT NOT NULL,
    "term" TEXT NOT NULL,

    CONSTRAINT "CourseOffering_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Course_courseId_key" ON "Course"("courseId");

-- CreateIndex
CREATE INDEX "Course_subjectCode_catalogNumber_idx" ON "Course"("subjectCode", "catalogNumber");

-- CreateIndex
CREATE INDEX "CourseOffering_termCode_idx" ON "CourseOffering"("termCode");

-- CreateIndex
CREATE UNIQUE INDEX "CourseOffering_courseId_courseOfferNumber_termCode_key" ON "CourseOffering"("courseId", "courseOfferNumber", "termCode");

-- AddForeignKey
ALTER TABLE "CourseOffering" ADD CONSTRAINT "CourseOffering_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("courseId") ON DELETE CASCADE ON UPDATE CASCADE;
