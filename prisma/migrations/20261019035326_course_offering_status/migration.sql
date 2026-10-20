/*
  Warnings:

  - You are about to drop the column `courseOfferNumber` on the `CourseOffering` table. All the data in the column will be lost.
  - You are about to drop the column `term` on the `CourseOffering` table. All the data in the column will be lost.
  - You are about to drop the column `termName` on the `CourseOffering` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[courseId,termCode]` on the table `CourseOffering` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `status` to the `CourseOffering` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OfferingStatus" AS ENUM ('OFFERED', 'NOT_FOUND');

-- DropIndex
DROP INDEX "CourseOffering_courseId_courseOfferNumber_termCode_key";

-- DropIndex
DROP INDEX "CourseOffering_termCode_idx";

-- AlterTable
ALTER TABLE "CourseOffering" DROP COLUMN "courseOfferNumber",
DROP COLUMN "term",
DROP COLUMN "termName",
ADD COLUMN     "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" "OfferingStatus" NOT NULL;

-- CreateIndex
CREATE INDEX "CourseOffering_termCode_status_idx" ON "CourseOffering"("termCode", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CourseOffering_courseId_termCode_key" ON "CourseOffering"("courseId", "termCode");
