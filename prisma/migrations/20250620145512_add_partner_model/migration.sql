-- CreateEnum
CREATE TYPE "CorporateType" AS ENUM ('CORPORATION', 'INDIVIDUAL', 'UNSPECIFIED');

-- CreateEnum
CREATE TYPE "FeeType" AS ENUM ('OURS', 'THEIRS');

-- CreateTable
CREATE TABLE "Partner" (
    "id" SERIAL NOT NULL,
    "displayName" TEXT NOT NULL,
    "officialName" TEXT,
    "ocrName" TEXT NOT NULL,
    "companyNameKana" TEXT,
    "corporateNumber" VARCHAR(13),
    "invoiceRegistrationNumber" VARCHAR(14),
    "corporateType" "CorporateType",
    "address" TEXT,
    "closingDate" INTEGER,
    "feeType" "FeeType",

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankAccount" (
    "id" SERIAL NOT NULL,
    "bankName" TEXT NOT NULL,
    "branchName" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountHolder" TEXT NOT NULL,
    "partnerId" INTEGER NOT NULL,

    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
