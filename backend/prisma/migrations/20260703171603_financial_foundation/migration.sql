-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "FinancialTitleStatus" AS ENUM ('OPEN', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'CANCELED', 'RECONCILED', 'DIVERGENT');

-- CreateEnum
CREATE TYPE "GatewayProvider" AS ENUM ('REDE', 'STONE', 'CIELO', 'GETNET', 'PAGSEGURO', 'MERCADO_PAGO', 'OTHER');

-- CreateEnum
CREATE TYPE "GatewayIntegrationStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ERROR');

-- CreateEnum
CREATE TYPE "RawPayloadStatus" AS ENUM ('RECEIVED', 'STORED', 'NORMALIZED', 'PROCESSED', 'ERROR', 'REPROCESSED');

-- CreateEnum
CREATE TYPE "RedeTransactionStatus" AS ENUM ('AUTHORIZED', 'CAPTURED', 'CANCELED', 'REFUNDED', 'CHARGEBACK', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ReceivableStatus" AS ENUM ('PENDING', 'PAID', 'CANCELED', 'ANTICIPATED', 'ADJUSTED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ReconciliationStatus" AS ENUM ('PENDING', 'MATCHED_AUTOMATICALLY', 'MATCHED_MANUALLY', 'DIVERGENT', 'NOT_FOUND', 'DUPLICATED', 'CANCELED', 'REVERSED', 'ERROR');

-- CreateEnum
CREATE TYPE "ReconciliationMatchLevel" AS ENUM ('STRONG', 'MEDIUM', 'WEAK', 'NONE');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'SOFT_DELETE', 'IMPORT', 'NORMALIZE', 'PROCESS', 'RECONCILE_AUTO', 'RECONCILE_MANUAL', 'REVERSE_RECONCILIATION', 'EXPORT', 'VIEW_RAW_PAYLOAD', 'LOGIN', 'LOGOUT', 'ERROR');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'PARTIAL_SUCCESS');

-- CreateEnum
CREATE TYPE "ApiLogDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "ReconciliationDivergenceType" AS ENUM ('VALUE_DIFFERENCE', 'DATE_DIFFERENCE', 'INSTALLMENT_DIFFERENCE', 'STATUS_DIFFERENCE', 'DUPLICATED_RECEIVABLE', 'TITLE_NOT_FOUND', 'RECEIVABLE_NOT_FOUND', 'MANUAL_REVIEW_REQUIRED');

-- CreateEnum
CREATE TYPE "DivergenceSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastLoginAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "roleId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_titles" (
    "id" UUID NOT NULL,
    "externalId" TEXT,
    "titleNumber" TEXT NOT NULL,
    "customerName" TEXT,
    "customerDocument" TEXT,
    "orderNumber" TEXT,
    "installmentNumber" INTEGER,
    "totalInstallments" INTEGER,
    "grossAmount" DECIMAL(14,2) NOT NULL,
    "netAmountExpected" DECIMAL(14,2),
    "paidAmount" DECIMAL(14,2),
    "dueDate" TIMESTAMP(3) NOT NULL,
    "issueDate" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "status" "FinancialTitleStatus" NOT NULL DEFAULT 'OPEN',
    "gatewayProvider" "GatewayProvider",
    "gatewayReference" TEXT,
    "nsu" TEXT,
    "authorizationCode" TEXT,
    "tid" TEXT,
    "transactionId" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "financial_titles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gateway_integrations" (
    "id" UUID NOT NULL,
    "provider" "GatewayProvider" NOT NULL,
    "name" TEXT NOT NULL,
    "status" "GatewayIntegrationStatus" NOT NULL DEFAULT 'INACTIVE',
    "baseUrl" TEXT,
    "merchantId" TEXT,
    "config" JSONB NOT NULL DEFAULT '{}',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "gateway_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "raw_payloads" (
    "id" UUID NOT NULL,
    "provider" "GatewayProvider" NOT NULL,
    "integrationId" UUID,
    "endpoint" TEXT,
    "httpMethod" TEXT,
    "requestParams" JSONB,
    "requestPayload" JSONB,
    "responsePayload" JSONB,
    "responseStatus" INTEGER,
    "rawPayload" JSONB NOT NULL,
    "payloadHash" TEXT,
    "status" "RawPayloadStatus" NOT NULL DEFAULT 'RECEIVED',
    "errorMessage" TEXT,
    "processedAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "raw_payloads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rede_transactions" (
    "id" UUID NOT NULL,
    "rawPayloadId" UUID,
    "integrationId" UUID,
    "transactionId" TEXT NOT NULL,
    "tid" TEXT,
    "nsu" TEXT,
    "authorizationCode" TEXT,
    "orderNumber" TEXT,
    "saleDate" TIMESTAMP(3),
    "captureDate" TIMESTAMP(3),
    "grossAmount" DECIMAL(14,2) NOT NULL,
    "netAmount" DECIMAL(14,2),
    "feeAmount" DECIMAL(14,2),
    "installmentNumber" INTEGER,
    "totalInstallments" INTEGER,
    "brand" TEXT,
    "paymentMethod" TEXT,
    "status" "RedeTransactionStatus" NOT NULL DEFAULT 'UNKNOWN',
    "establishmentCode" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rede_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rede_receivables" (
    "id" UUID NOT NULL,
    "rawPayloadId" UUID,
    "transactionId" TEXT NOT NULL,
    "redeTransactionId" UUID,
    "nsu" TEXT,
    "authorizationCode" TEXT,
    "expectedPaymentDate" TIMESTAMP(3),
    "actualPaymentDate" TIMESTAMP(3),
    "grossAmount" DECIMAL(14,2) NOT NULL,
    "netAmount" DECIMAL(14,2),
    "feeAmount" DECIMAL(14,2),
    "adjustmentAmount" DECIMAL(14,2),
    "installmentNumber" INTEGER,
    "totalInstallments" INTEGER,
    "status" "ReceivableStatus" NOT NULL DEFAULT 'UNKNOWN',
    "bankCode" TEXT,
    "agency" TEXT,
    "account" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rede_receivables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reconciliations" (
    "id" UUID NOT NULL,
    "financialTitleId" UUID,
    "redeTransactionId" UUID,
    "redeReceivableId" UUID,
    "provider" "GatewayProvider" NOT NULL,
    "status" "ReconciliationStatus" NOT NULL DEFAULT 'PENDING',
    "matchLevel" "ReconciliationMatchLevel" NOT NULL DEFAULT 'NONE',
    "score" SMALLINT NOT NULL DEFAULT 0,
    "matchedBy" TEXT,
    "matchedAt" TIMESTAMP(3),
    "reversedAt" TIMESTAMP(3),
    "reversalReason" TEXT,
    "grossAmountDiff" DECIMAL(14,2),
    "netAmountDiff" DECIMAL(14,2),
    "dateDiffDays" INTEGER,
    "ruleApplied" TEXT,
    "justification" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "reconciliations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reconciliation_divergences" (
    "id" UUID NOT NULL,
    "reconciliationId" UUID,
    "financialTitleId" UUID,
    "redeReceivableId" UUID,
    "divergenceType" "ReconciliationDivergenceType" NOT NULL,
    "description" TEXT NOT NULL,
    "expectedValue" JSONB,
    "actualValue" JSONB,
    "severity" "DivergenceSeverity" NOT NULL DEFAULT 'MEDIUM',
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "resolutionNote" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reconciliation_divergences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_events" (
    "id" UUID NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "userId" UUID,
    "origin" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "before" JSONB,
    "after" JSONB,
    "justification" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "eventHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_logs" (
    "id" UUID NOT NULL,
    "provider" "GatewayProvider",
    "integrationId" UUID,
    "direction" "ApiLogDirection" NOT NULL,
    "endpoint" TEXT NOT NULL,
    "httpMethod" TEXT NOT NULL,
    "requestHeaders" JSONB,
    "requestPayload" JSONB,
    "responseStatus" INTEGER,
    "responsePayload" JSONB,
    "durationMs" INTEGER,
    "errorMessage" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_executions" (
    "id" UUID NOT NULL,
    "jobName" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "processedCount" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "isEncrypted" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "user_roles_roleId_idx" ON "user_roles"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_userId_roleId_key" ON "user_roles"("userId", "roleId");

-- CreateIndex
CREATE INDEX "financial_titles_externalId_idx" ON "financial_titles"("externalId");

-- CreateIndex
CREATE INDEX "financial_titles_titleNumber_idx" ON "financial_titles"("titleNumber");

-- CreateIndex
CREATE INDEX "financial_titles_orderNumber_idx" ON "financial_titles"("orderNumber");

-- CreateIndex
CREATE INDEX "financial_titles_nsu_idx" ON "financial_titles"("nsu");

-- CreateIndex
CREATE INDEX "financial_titles_authorizationCode_idx" ON "financial_titles"("authorizationCode");

-- CreateIndex
CREATE INDEX "financial_titles_tid_idx" ON "financial_titles"("tid");

-- CreateIndex
CREATE INDEX "financial_titles_transactionId_idx" ON "financial_titles"("transactionId");

-- CreateIndex
CREATE INDEX "financial_titles_status_idx" ON "financial_titles"("status");

-- CreateIndex
CREATE INDEX "financial_titles_dueDate_idx" ON "financial_titles"("dueDate");

-- CreateIndex
CREATE INDEX "financial_titles_gatewayProvider_idx" ON "financial_titles"("gatewayProvider");

-- CreateIndex
CREATE INDEX "gateway_integrations_provider_idx" ON "gateway_integrations"("provider");

-- CreateIndex
CREATE INDEX "gateway_integrations_status_idx" ON "gateway_integrations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "gateway_integrations_provider_name_key" ON "gateway_integrations"("provider", "name");

-- CreateIndex
CREATE UNIQUE INDEX "raw_payloads_payloadHash_key" ON "raw_payloads"("payloadHash");

-- CreateIndex
CREATE INDEX "raw_payloads_integrationId_idx" ON "raw_payloads"("integrationId");

-- CreateIndex
CREATE INDEX "raw_payloads_provider_idx" ON "raw_payloads"("provider");

-- CreateIndex
CREATE INDEX "raw_payloads_status_idx" ON "raw_payloads"("status");

-- CreateIndex
CREATE INDEX "raw_payloads_receivedAt_idx" ON "raw_payloads"("receivedAt");

-- CreateIndex
CREATE INDEX "rede_transactions_rawPayloadId_idx" ON "rede_transactions"("rawPayloadId");

-- CreateIndex
CREATE INDEX "rede_transactions_integrationId_idx" ON "rede_transactions"("integrationId");

-- CreateIndex
CREATE INDEX "rede_transactions_transactionId_idx" ON "rede_transactions"("transactionId");

-- CreateIndex
CREATE INDEX "rede_transactions_tid_idx" ON "rede_transactions"("tid");

-- CreateIndex
CREATE INDEX "rede_transactions_nsu_idx" ON "rede_transactions"("nsu");

-- CreateIndex
CREATE INDEX "rede_transactions_authorizationCode_idx" ON "rede_transactions"("authorizationCode");

-- CreateIndex
CREATE INDEX "rede_transactions_orderNumber_idx" ON "rede_transactions"("orderNumber");

-- CreateIndex
CREATE INDEX "rede_transactions_saleDate_idx" ON "rede_transactions"("saleDate");

-- CreateIndex
CREATE INDEX "rede_transactions_status_idx" ON "rede_transactions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "rede_transactions_transactionId_installmentNumber_key" ON "rede_transactions"("transactionId", "installmentNumber");

-- CreateIndex
CREATE INDEX "rede_receivables_rawPayloadId_idx" ON "rede_receivables"("rawPayloadId");

-- CreateIndex
CREATE INDEX "rede_receivables_redeTransactionId_idx" ON "rede_receivables"("redeTransactionId");

-- CreateIndex
CREATE INDEX "rede_receivables_transactionId_idx" ON "rede_receivables"("transactionId");

-- CreateIndex
CREATE INDEX "rede_receivables_nsu_idx" ON "rede_receivables"("nsu");

-- CreateIndex
CREATE INDEX "rede_receivables_authorizationCode_idx" ON "rede_receivables"("authorizationCode");

-- CreateIndex
CREATE INDEX "rede_receivables_expectedPaymentDate_idx" ON "rede_receivables"("expectedPaymentDate");

-- CreateIndex
CREATE INDEX "rede_receivables_actualPaymentDate_idx" ON "rede_receivables"("actualPaymentDate");

-- CreateIndex
CREATE INDEX "rede_receivables_status_idx" ON "rede_receivables"("status");

-- CreateIndex
CREATE UNIQUE INDEX "rede_receivables_transactionId_installmentNumber_expectedPa_key" ON "rede_receivables"("transactionId", "installmentNumber", "expectedPaymentDate");

-- CreateIndex
CREATE INDEX "reconciliations_financialTitleId_idx" ON "reconciliations"("financialTitleId");

-- CreateIndex
CREATE INDEX "reconciliations_redeTransactionId_idx" ON "reconciliations"("redeTransactionId");

-- CreateIndex
CREATE INDEX "reconciliations_redeReceivableId_idx" ON "reconciliations"("redeReceivableId");

-- CreateIndex
CREATE INDEX "reconciliations_status_idx" ON "reconciliations"("status");

-- CreateIndex
CREATE INDEX "reconciliations_score_idx" ON "reconciliations"("score");

-- CreateIndex
CREATE INDEX "reconciliation_divergences_reconciliationId_idx" ON "reconciliation_divergences"("reconciliationId");

-- CreateIndex
CREATE INDEX "reconciliation_divergences_financialTitleId_idx" ON "reconciliation_divergences"("financialTitleId");

-- CreateIndex
CREATE INDEX "reconciliation_divergences_redeReceivableId_idx" ON "reconciliation_divergences"("redeReceivableId");

-- CreateIndex
CREATE INDEX "reconciliation_divergences_divergenceType_idx" ON "reconciliation_divergences"("divergenceType");

-- CreateIndex
CREATE INDEX "reconciliation_divergences_resolved_idx" ON "reconciliation_divergences"("resolved");

-- CreateIndex
CREATE UNIQUE INDEX "audit_events_eventHash_key" ON "audit_events"("eventHash");

-- CreateIndex
CREATE INDEX "audit_events_entity_entityId_idx" ON "audit_events"("entity", "entityId");

-- CreateIndex
CREATE INDEX "audit_events_action_idx" ON "audit_events"("action");

-- CreateIndex
CREATE INDEX "audit_events_userId_idx" ON "audit_events"("userId");

-- CreateIndex
CREATE INDEX "audit_events_createdAt_idx" ON "audit_events"("createdAt");

-- CreateIndex
CREATE INDEX "api_logs_provider_idx" ON "api_logs"("provider");

-- CreateIndex
CREATE INDEX "api_logs_integrationId_idx" ON "api_logs"("integrationId");

-- CreateIndex
CREATE INDEX "api_logs_direction_idx" ON "api_logs"("direction");

-- CreateIndex
CREATE INDEX "api_logs_endpoint_idx" ON "api_logs"("endpoint");

-- CreateIndex
CREATE INDEX "api_logs_responseStatus_idx" ON "api_logs"("responseStatus");

-- CreateIndex
CREATE INDEX "api_logs_createdAt_idx" ON "api_logs"("createdAt");

-- CreateIndex
CREATE INDEX "job_executions_jobName_idx" ON "job_executions"("jobName");

-- CreateIndex
CREATE INDEX "job_executions_status_idx" ON "job_executions"("status");

-- CreateIndex
CREATE INDEX "job_executions_startedAt_idx" ON "job_executions"("startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raw_payloads" ADD CONSTRAINT "raw_payloads_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "gateway_integrations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rede_transactions" ADD CONSTRAINT "rede_transactions_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "gateway_integrations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rede_transactions" ADD CONSTRAINT "rede_transactions_rawPayloadId_fkey" FOREIGN KEY ("rawPayloadId") REFERENCES "raw_payloads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rede_receivables" ADD CONSTRAINT "rede_receivables_rawPayloadId_fkey" FOREIGN KEY ("rawPayloadId") REFERENCES "raw_payloads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rede_receivables" ADD CONSTRAINT "rede_receivables_redeTransactionId_fkey" FOREIGN KEY ("redeTransactionId") REFERENCES "rede_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliations" ADD CONSTRAINT "reconciliations_financialTitleId_fkey" FOREIGN KEY ("financialTitleId") REFERENCES "financial_titles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliations" ADD CONSTRAINT "reconciliations_redeTransactionId_fkey" FOREIGN KEY ("redeTransactionId") REFERENCES "rede_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliations" ADD CONSTRAINT "reconciliations_redeReceivableId_fkey" FOREIGN KEY ("redeReceivableId") REFERENCES "rede_receivables"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliation_divergences" ADD CONSTRAINT "reconciliation_divergences_reconciliationId_fkey" FOREIGN KEY ("reconciliationId") REFERENCES "reconciliations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliation_divergences" ADD CONSTRAINT "reconciliation_divergences_financialTitleId_fkey" FOREIGN KEY ("financialTitleId") REFERENCES "financial_titles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliation_divergences" ADD CONSTRAINT "reconciliation_divergences_redeReceivableId_fkey" FOREIGN KEY ("redeReceivableId") REFERENCES "rede_receivables"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_logs" ADD CONSTRAINT "api_logs_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "gateway_integrations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Business checks
ALTER TABLE "reconciliations" ADD CONSTRAINT "reconciliations_score_range_chk" CHECK ("score" BETWEEN 0 AND 100);

ALTER TABLE "reconciliations" ADD CONSTRAINT "reconciliations_manual_justification_chk" CHECK (
    "status" <> 'MATCHED_MANUALLY'
    OR NULLIF(BTRIM("justification"), '') IS NOT NULL
);

ALTER TABLE "reconciliations" ADD CONSTRAINT "reconciliations_reversal_reason_chk" CHECK (
    "status" <> 'REVERSED'
    OR NULLIF(BTRIM("reversalReason"), '') IS NOT NULL
);
