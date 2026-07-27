-- AlterTable
ALTER TABLE "itau_boleto_movements" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "itau_boletos" ALTER COLUMN "id" DROP DEFAULT;

-- RenameIndex
ALTER INDEX "itau_boleto_movements_unique_idx" RENAME TO "itau_boleto_movements_movementDate_walletCode_ourNumber_you_key";
