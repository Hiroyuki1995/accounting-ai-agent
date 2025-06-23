/*
  Warnings:

  - A unique constraint covering the columns `[registratedNumber]` on the table `Corporation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Corporation_registratedNumber_key" ON "Corporation"("registratedNumber");
