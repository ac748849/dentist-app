/*
  Warnings:

  - You are about to drop the column `entityType` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `dayOfWeek` on the `TimeSlot` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `TimeSlot` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[googleCalendarEventId]` on the table `Appointment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[googleCalendarId]` on the table `Dentist` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `duration` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entity` to the `AuditLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `source` to the `AuditLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userType` to the `AuditLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `TimeSlot` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `startTime` on the `TimeSlot` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `endTime` on the `TimeSlot` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "InterventionType" AS ENUM ('CONTROLE', 'URGENCE', 'PREMIERE_VISITE', 'CARIE', 'DEVITALISATION', 'EXTRACTION', 'DETARTRAGE', 'BLANCHIMENT', 'COURONNE', 'BRIDGE', 'IMPLANT', 'PROTHESE_COMPLETE', 'PROTHESE_PARTIELLE', 'ORTHODONTIE_CONSULTATION', 'ORTHODONTIE_SUIVI', 'ORTHODONTIE_POSE', 'ORTHODONTIE_RETRAIT', 'PEDIATRIE_CONTROLE', 'PEDIATRIE_SOIN', 'PEDIATRIE_PREVENTION', 'CHIRURGIE_SIMPLE', 'CHIRURGIE_COMPLEXE', 'GREFFE_OSSEUSE', 'AUTRE');

-- CreateEnum
CREATE TYPE "PatientAge" AS ENUM ('ENFANT', 'ADOLESCENT', 'ADULTE', 'SENIOR');

-- DropForeignKey
ALTER TABLE "TimeSlot" DROP CONSTRAINT "TimeSlot_dentistId_fkey";

-- DropIndex
DROP INDEX "AuditLog_entityType_entityId_idx";

-- DropIndex
DROP INDEX "TimeSlot_dentistId_idx";

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "automationLogs" JSONB,
ADD COLUMN     "confirmationSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "confirmationSentAt" TIMESTAMP(3),
ADD COLUMN     "createdVia" TEXT,
ADD COLUMN     "dentistNotes" TEXT,
ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "googleCalendarEventId" TEXT,
ADD COLUMN     "googleCalendarLink" TEXT,
ADD COLUMN     "interventionType" "InterventionType" NOT NULL DEFAULT 'CONTROLE',
ADD COLUMN     "lastSyncedAt" TIMESTAMP(3),
ADD COLUMN     "n8nExecutionId" TEXT,
ADD COLUMN     "reminderSentAt" TIMESTAMP(3),
ADD COLUMN     "syncedWithGoogle" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "entityType",
DROP COLUMN "metadata",
ADD COLUMN     "changes" JSONB,
ADD COLUMN     "entity" TEXT NOT NULL,
ADD COLUMN     "source" TEXT NOT NULL,
ADD COLUMN     "userAgent" TEXT,
ADD COLUMN     "userType" TEXT NOT NULL,
ALTER COLUMN "entityId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Dentist" ADD COLUMN     "googleAccessToken" TEXT,
ADD COLUMN     "googleCalendarEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "googleCalendarId" TEXT,
ADD COLUMN     "googleRefreshToken" TEXT,
ADD COLUMN     "googleTokenExpiry" TIMESTAMP(3),
ADD COLUMN     "googleWebhookChannelId" TEXT,
ADD COLUMN     "googleWebhookExpiry" TIMESTAMP(3),
ALTER COLUMN "workingHours" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "ageCategory" "PatientAge" NOT NULL DEFAULT 'ADULTE',
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "medicalHistory" JSONB,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "preferredChannel" TEXT,
ADD COLUMN     "whatsappPhone" TEXT;

-- AlterTable
ALTER TABLE "TimeSlot" DROP COLUMN "dayOfWeek",
DROP COLUMN "isActive",
ADD COLUMN     "allowedInterventionTypes" "InterventionType"[],
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isRecurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recurrenceRule" TEXT,
ADD COLUMN     "unavailableReason" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "startTime",
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL,
DROP COLUMN "endTime",
ADD COLUMN     "endTime" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "InterventionDuration" (
    "id" TEXT NOT NULL,
    "interventionType" "InterventionType" NOT NULL,
    "defaultDuration" INTEGER NOT NULL,
    "minDuration" INTEGER NOT NULL,
    "maxDuration" INTEGER NOT NULL,
    "estimatedPrice" DOUBLE PRECISION,
    "requiresPreparation" BOOLEAN NOT NULL DEFAULT false,
    "preparationNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterventionDuration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "N8NWebhook" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "webhookUrl" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "events" TEXT[],
    "totalCalls" INTEGER NOT NULL DEFAULT 0,
    "lastCalledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "N8NWebhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppConfig" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InterventionDuration_interventionType_key" ON "InterventionDuration"("interventionType");

-- CreateIndex
CREATE UNIQUE INDEX "N8NWebhook_name_key" ON "N8NWebhook"("name");

-- CreateIndex
CREATE UNIQUE INDEX "N8NWebhook_webhookUrl_key" ON "N8NWebhook"("webhookUrl");

-- CreateIndex
CREATE UNIQUE INDEX "AppConfig_key_key" ON "AppConfig"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_googleCalendarEventId_key" ON "Appointment"("googleCalendarEventId");

-- CreateIndex
CREATE INDEX "Appointment_status_idx" ON "Appointment"("status");

-- CreateIndex
CREATE INDEX "Appointment_interventionType_idx" ON "Appointment"("interventionType");

-- CreateIndex
CREATE INDEX "Appointment_startTime_idx" ON "Appointment"("startTime");

-- CreateIndex
CREATE INDEX "Appointment_googleCalendarEventId_idx" ON "Appointment"("googleCalendarEventId");

-- CreateIndex
CREATE INDEX "AuditLog_entityId_idx" ON "AuditLog"("entityId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE UNIQUE INDEX "Dentist_googleCalendarId_key" ON "Dentist"("googleCalendarId");

-- CreateIndex
CREATE INDEX "Dentist_email_idx" ON "Dentist"("email");

-- CreateIndex
CREATE INDEX "Patient_phone_idx" ON "Patient"("phone");

-- CreateIndex
CREATE INDEX "Patient_whatsappPhone_idx" ON "Patient"("whatsappPhone");

-- CreateIndex
CREATE INDEX "TimeSlot_dentistId_startTime_idx" ON "TimeSlot"("dentistId", "startTime");

-- CreateIndex
CREATE INDEX "TimeSlot_isAvailable_idx" ON "TimeSlot"("isAvailable");

-- AddForeignKey
ALTER TABLE "TimeSlot" ADD CONSTRAINT "TimeSlot_dentistId_fkey" FOREIGN KEY ("dentistId") REFERENCES "Dentist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
