-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "orgId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "BankAccount" ALTER COLUMN "orgId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Partner" ALTER COLUMN "orgId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "orgId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "files" ALTER COLUMN "orgId" DROP DEFAULT;
