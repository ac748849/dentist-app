-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'DENTIST', 'PATIENT');

-- CreateEnum
CREATE TYPE "PatientAge" AS ENUM ('ENFANT', 'ADOLESCENT', 'ADULTE', 'SENIOR');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "InterventionType" AS ENUM ('CONTROLE', 'URGENCE', 'PREMIERE_VISITE', 'CARIE', 'DEVITALISATION', 'EXTRACTION', 'DETARTRAGE', 'BLANCHIMENT', 'COURONNE', 'BRIDGE', 'IMPLANT', 'PROTHESE_COMPLETE', 'PROTHESE_PARTIELLE', 'ORTHODONTIE_CONSULTATION', 'ORTHODONTIE_SUIVI', 'ORTHODONTIE_POSE', 'ORTHODONTIE_RETRAIT', 'PEDIATRIE_CONTROLE', 'PEDIATRIE_SOIN', 'PEDIATRIE_PREVENTION', 'CHIRURGIE_SIMPLE', 'CHIRURGIE_COMPLEXE', 'GREFFE_OSSEUSE', 'AUTRE');

-- CreateEnum
CREATE TYPE "KBCategory" AS ENUM ('TARIFS', 'ACCES', 'FAQ', 'HORAIRES', 'URGENCES', 'SERVICES', 'EQUIPE', 'AUTRE');

-- CreateEnum
CREATE TYPE "RuleType" AS ENUM ('HORAIRE', 'JOUR', 'PAUSE', 'BLOCAGE', 'PREFERENCE');

-- CreateEnum
CREATE TYPE "RuleAction" AS ENUM ('BLOCK', 'DISCOURAGE', 'PREFER');

-- CreateEnum
CREATE TYPE "ConversationChannel" AS ENUM ('WEB', 'WHATSAPP', 'TELEGRAM');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'PATIENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "ageCategory" "PatientAge" NOT NULL DEFAULT 'ADULTE',
    "whatsappPhone" TEXT,
    "telegramId" TEXT,
    "preferredChannel" TEXT,
    "medicalHistory" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dentist" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "specialties" TEXT[],
    "workingHours" JSONB,
    "googleCalendarId" TEXT,
    "googleAccessToken" TEXT,
    "googleRefreshToken" TEXT,
    "googleTokenExpiry" TIMESTAMP(3),
    "googleCalendarEnabled" BOOLEAN NOT NULL DEFAULT false,
    "googleWebhookChannelId" TEXT,
    "googleWebhookExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dentist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "dentistId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
    "source" TEXT NOT NULL DEFAULT 'web',
    "interventionType" "InterventionType" NOT NULL DEFAULT 'CONTROLE',
    "duration" INTEGER NOT NULL,
    "googleCalendarEventId" TEXT,
    "googleCalendarLink" TEXT,
    "syncedWithGoogle" BOOLEAN NOT NULL DEFAULT false,
    "lastSyncedAt" TIMESTAMP(3),
    "n8nExecutionId" TEXT,
    "automationLogs" JSONB,
    "notes" TEXT,
    "dentistNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "KnowledgeBase" (
    "id" TEXT NOT NULL,
    "dentistId" TEXT NOT NULL,
    "category" "KBCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "keywords" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeBase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomRule" (
    "id" TEXT NOT NULL,
    "dentistId" TEXT NOT NULL,
    "ruleType" "RuleType" NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "dayOfWeek" TEXT,
    "timeStart" TEXT,
    "timeEnd" TEXT,
    "specificDate" TIMESTAMP(3),
    "dateRangeStart" TIMESTAMP(3),
    "dateRangeEnd" TIMESTAMP(3),
    "description" TEXT NOT NULL,
    "action" "RuleAction" NOT NULL DEFAULT 'BLOCK',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationHistory" (
    "id" TEXT NOT NULL,
    "patientId" TEXT,
    "channel" "ConversationChannel" NOT NULL,
    "externalId" TEXT,
    "messages" JSONB NOT NULL,
    "currentIntent" TEXT,
    "currentStep" TEXT,
    "extractedData" JSONB,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "satisfactionScore" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ConversationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientPreferences" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "preferredDays" TEXT[],
    "preferredTimes" TEXT NOT NULL DEFAULT 'anytime',
    "urgencyDefault" TEXT NOT NULL DEFAULT 'normal',
    "avoidDays" TEXT[],
    "minNoticeHours" INTEGER,
    "bookingHistory" JSONB,
    "lastBookingDate" TIMESTAMP(3),
    "averageRescheduleDays" INTEGER,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'fr',
    "smsReminders" BOOLEAN NOT NULL DEFAULT true,
    "whatsappReminders" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AILog" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT,
    "patientId" TEXT,
    "prompt" TEXT NOT NULL,
    "tools" JSONB,
    "response" TEXT NOT NULL,
    "toolCalls" JSONB,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "tokensInput" INTEGER,
    "tokensOutput" INTEGER,
    "latencyMs" INTEGER,
    "cost" DOUBLE PRECISION,
    "wasHelpful" BOOLEAN,
    "userFeedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AILog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "changes" JSONB,
    "source" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "N8NWebhook" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "webhookUrl" TEXT NOT NULL,
    "events" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastTriggered" TIMESTAMP(3),
    "totalCalls" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "N8NWebhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppConfig" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_phone_key" ON "Patient"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_telegramId_key" ON "Patient"("telegramId");

-- CreateIndex
CREATE UNIQUE INDEX "Dentist_email_key" ON "Dentist"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Dentist_googleCalendarId_key" ON "Dentist"("googleCalendarId");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_googleCalendarEventId_key" ON "Appointment"("googleCalendarEventId");

-- CreateIndex
CREATE INDEX "Appointment_dentistId_startTime_idx" ON "Appointment"("dentistId", "startTime");

-- CreateIndex
CREATE INDEX "Appointment_patientId_idx" ON "Appointment"("patientId");

-- CreateIndex
CREATE INDEX "Appointment_status_idx" ON "Appointment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "InterventionDuration_interventionType_key" ON "InterventionDuration"("interventionType");

-- CreateIndex
CREATE INDEX "KnowledgeBase_dentistId_category_idx" ON "KnowledgeBase"("dentistId", "category");

-- CreateIndex
CREATE INDEX "KnowledgeBase_isActive_idx" ON "KnowledgeBase"("isActive");

-- CreateIndex
CREATE INDEX "CustomRule_dentistId_isActive_idx" ON "CustomRule"("dentistId", "isActive");

-- CreateIndex
CREATE INDEX "CustomRule_priority_idx" ON "CustomRule"("priority");

-- CreateIndex
CREATE INDEX "ConversationHistory_externalId_channel_idx" ON "ConversationHistory"("externalId", "channel");

-- CreateIndex
CREATE INDEX "ConversationHistory_patientId_idx" ON "ConversationHistory"("patientId");

-- CreateIndex
CREATE INDEX "ConversationHistory_isCompleted_idx" ON "ConversationHistory"("isCompleted");

-- CreateIndex
CREATE UNIQUE INDEX "PatientPreferences_patientId_key" ON "PatientPreferences"("patientId");

-- CreateIndex
CREATE INDEX "AILog_conversationId_idx" ON "AILog"("conversationId");

-- CreateIndex
CREATE INDEX "AILog_provider_createdAt_idx" ON "AILog"("provider", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "N8NWebhook_name_key" ON "N8NWebhook"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AppConfig_key_key" ON "AppConfig"("key");

-- CreateIndex
CREATE INDEX "AppConfig_category_idx" ON "AppConfig"("category");

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_dentistId_fkey" FOREIGN KEY ("dentistId") REFERENCES "Dentist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeBase" ADD CONSTRAINT "KnowledgeBase_dentistId_fkey" FOREIGN KEY ("dentistId") REFERENCES "Dentist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomRule" ADD CONSTRAINT "CustomRule_dentistId_fkey" FOREIGN KEY ("dentistId") REFERENCES "Dentist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationHistory" ADD CONSTRAINT "ConversationHistory_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientPreferences" ADD CONSTRAINT "PatientPreferences_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
