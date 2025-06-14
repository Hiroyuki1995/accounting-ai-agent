-- AlterTable
ALTER TABLE "files" ADD COLUMN     "invoice_date" DATE,
ADD COLUMN     "issuer_name" TEXT,
ADD COLUMN     "registration_number" TEXT,
ADD COLUMN     "tax_10_amount" BIGINT,
ADD COLUMN     "tax_10_base" BIGINT,
ADD COLUMN     "tax_10_total" BIGINT,
ADD COLUMN     "tax_8_amount" BIGINT,
ADD COLUMN     "tax_8_base" BIGINT,
ADD COLUMN     "tax_8_total" BIGINT,
ADD COLUMN     "total_amount" BIGINT;
