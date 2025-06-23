/*
  Warnings:

  - Added the required column `orgId` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgId` to the `BankAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgId` to the `Partner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgId` to the `files` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- デフォルト値を「org_gAZ2AlXKM3CLaBIw」に設定
ALTER TABLE "Account" ADD COLUMN     "orgId" TEXT NOT NULL DEFAULT 'org_gAZ2AlXKM3CLaBIw';

-- AlterTable
ALTER TABLE "BankAccount" ADD COLUMN     "orgId" TEXT NOT NULL DEFAULT 'org_gAZ2AlXKM3CLaBIw';

-- AlterTable
ALTER TABLE "Partner" ADD COLUMN     "orgId" TEXT NOT NULL DEFAULT 'org_gAZ2AlXKM3CLaBIw';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "orgId" TEXT NOT NULL DEFAULT 'org_gAZ2AlXKM3CLaBIw';

-- AlterTable
ALTER TABLE "files" ADD COLUMN     "orgId" TEXT NOT NULL DEFAULT 'org_gAZ2AlXKM3CLaBIw';
