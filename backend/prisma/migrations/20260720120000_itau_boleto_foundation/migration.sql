ALTER TYPE "GatewayProvider" ADD VALUE 'ITAU';

CREATE TYPE "ItauBoletoStatus" AS ENUM ('OPEN', 'IN_PAYMENT', 'PAID', 'CANCELED', 'OVERDUE', 'UNKNOWN');

CREATE TYPE "ItauBoletoMovementType" AS ENUM ('ENTRY', 'LIQUIDATION', 'CANCELATION', 'UNKNOWN');

CREATE TYPE "ItauBoletoChargeType" AS ENUM ('BOLETO', 'BOLECODE', 'DISCOUNTED_BOLETO', 'UNKNOWN');

CREATE TABLE "itau_boletos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rawPayloadId" UUID,
    "integrationId" UUID,
    "boletoId" TEXT,
    "beneficiaryId" TEXT NOT NULL,
    "walletCode" TEXT,
    "ourNumber" TEXT NOT NULL,
    "ourNumberDigit" TEXT,
    "yourNumber" TEXT,
    "marketIdentifier" TEXT,
    "barcode" TEXT,
    "digitableLine" TEXT,
    "payerName" TEXT,
    "payerDocument" TEXT,
    "issueDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "paymentLimitDate" TIMESTAMP(3),
    "amount" DECIMAL(14,2),
    "paidAmount" DECIMAL(14,2),
    "paymentDate" TIMESTAMP(3),
    "status" "ItauBoletoStatus" NOT NULL DEFAULT 'UNKNOWN',
    "chargeType" "ItauBoletoChargeType" NOT NULL DEFAULT 'UNKNOWN',
    "hasPixQrCode" BOOLEAN NOT NULL DEFAULT false,
    "txid" TEXT,
    "pixEmv" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itau_boletos_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "itau_boleto_movements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rawPayloadId" UUID,
    "integrationId" UUID,
    "movementDate" TIMESTAMP(3) NOT NULL,
    "titleWalletMovementDate" TIMESTAMP(3),
    "inclusionDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "agency" TEXT,
    "account" TEXT,
    "beneficiaryAccountDigit" TEXT,
    "beneficiaryId" TEXT,
    "walletCode" TEXT,
    "ourNumber" TEXT NOT NULL,
    "ourNumberDigit" TEXT,
    "yourNumber" TEXT,
    "titleSequence" INTEGER,
    "payerName" TEXT,
    "receiverAgency" TEXT,
    "statusCode" TEXT,
    "movementType" "ItauBoletoMovementType" NOT NULL DEFAULT 'UNKNOWN',
    "chargeType" "ItauBoletoChargeType" NOT NULL DEFAULT 'UNKNOWN',
    "amount" DECIMAL(14,2),
    "netAmount" DECIMAL(14,2),
    "increaseAmount" DECIMAL(14,2),
    "decreaseAmount" DECIMAL(14,2),
    "hasCreditSplit" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itau_boleto_movements_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "itau_boletos_beneficiaryId_walletCode_ourNumber_key" ON "itau_boletos"("beneficiaryId", "walletCode", "ourNumber");
CREATE INDEX "itau_boletos_rawPayloadId_idx" ON "itau_boletos"("rawPayloadId");
CREATE INDEX "itau_boletos_integrationId_idx" ON "itau_boletos"("integrationId");
CREATE INDEX "itau_boletos_boletoId_idx" ON "itau_boletos"("boletoId");
CREATE INDEX "itau_boletos_ourNumber_idx" ON "itau_boletos"("ourNumber");
CREATE INDEX "itau_boletos_yourNumber_idx" ON "itau_boletos"("yourNumber");
CREATE INDEX "itau_boletos_marketIdentifier_idx" ON "itau_boletos"("marketIdentifier");
CREATE INDEX "itau_boletos_barcode_idx" ON "itau_boletos"("barcode");
CREATE INDEX "itau_boletos_dueDate_idx" ON "itau_boletos"("dueDate");
CREATE INDEX "itau_boletos_paymentDate_idx" ON "itau_boletos"("paymentDate");
CREATE INDEX "itau_boletos_status_idx" ON "itau_boletos"("status");
CREATE INDEX "itau_boletos_chargeType_idx" ON "itau_boletos"("chargeType");

CREATE UNIQUE INDEX "itau_boleto_movements_unique_idx" ON "itau_boleto_movements"("movementDate", "walletCode", "ourNumber", "yourNumber", "movementType", "titleSequence");
CREATE INDEX "itau_boleto_movements_rawPayloadId_idx" ON "itau_boleto_movements"("rawPayloadId");
CREATE INDEX "itau_boleto_movements_integrationId_idx" ON "itau_boleto_movements"("integrationId");
CREATE INDEX "itau_boleto_movements_movementDate_idx" ON "itau_boleto_movements"("movementDate");
CREATE INDEX "itau_boleto_movements_ourNumber_idx" ON "itau_boleto_movements"("ourNumber");
CREATE INDEX "itau_boleto_movements_yourNumber_idx" ON "itau_boleto_movements"("yourNumber");
CREATE INDEX "itau_boleto_movements_walletCode_idx" ON "itau_boleto_movements"("walletCode");
CREATE INDEX "itau_boleto_movements_movementType_idx" ON "itau_boleto_movements"("movementType");
CREATE INDEX "itau_boleto_movements_chargeType_idx" ON "itau_boleto_movements"("chargeType");

ALTER TABLE "itau_boletos" ADD CONSTRAINT "itau_boletos_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "gateway_integrations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "itau_boletos" ADD CONSTRAINT "itau_boletos_rawPayloadId_fkey" FOREIGN KEY ("rawPayloadId") REFERENCES "raw_payloads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "itau_boleto_movements" ADD CONSTRAINT "itau_boleto_movements_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "gateway_integrations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "itau_boleto_movements" ADD CONSTRAINT "itau_boleto_movements_rawPayloadId_fkey" FOREIGN KEY ("rawPayloadId") REFERENCES "raw_payloads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
