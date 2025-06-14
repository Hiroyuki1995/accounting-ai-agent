/*
  Warnings:

  - You are about to drop the column `file_path` on the `files` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "files" DROP COLUMN "file_path",
ADD COLUMN     "object_key" TEXT;
