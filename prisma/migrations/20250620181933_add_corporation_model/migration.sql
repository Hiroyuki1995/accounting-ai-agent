-- CreateTable
CREATE TABLE "Corporation" (
    "id" SERIAL NOT NULL,
    "sequenceNumber" INTEGER NOT NULL,
    "registratedNumber" VARCHAR(14) NOT NULL,
    "process" INTEGER NOT NULL,
    "correct" INTEGER NOT NULL,
    "kind" INTEGER NOT NULL,
    "country" INTEGER NOT NULL,
    "latest" INTEGER NOT NULL,
    "registrationDate" TIMESTAMP(3) NOT NULL,
    "updateDate" TIMESTAMP(3) NOT NULL,
    "disposalDate" TIMESTAMP(3),
    "expireDate" TIMESTAMP(3),
    "address" VARCHAR(600) NOT NULL,
    "addressPrefectureCode" INTEGER NOT NULL,
    "addressCityCode" INTEGER NOT NULL,

    CONSTRAINT "Corporation_pkey" PRIMARY KEY ("id")
);
