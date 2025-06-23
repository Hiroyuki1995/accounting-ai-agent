-- CreateTable
CREATE TABLE "CorporationNumberInfo" (
    "id" SERIAL NOT NULL,
    "sequenceNumber" INTEGER NOT NULL,
    "corporateNumber" TEXT NOT NULL,
    "process" INTEGER NOT NULL,
    "correct" INTEGER NOT NULL,
    "updateDate" TIMESTAMP(3) NOT NULL,
    "changeDate" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "nameImageId" TEXT,
    "kind" INTEGER NOT NULL,
    "prefectureName" TEXT NOT NULL,
    "cityName" TEXT NOT NULL,
    "streetNumber" TEXT NOT NULL,
    "addressImageId" TEXT,
    "prefectureCode" INTEGER NOT NULL,
    "cityCode" INTEGER NOT NULL,
    "postCode" TEXT NOT NULL,
    "addressOutside" TEXT,
    "addressOutsideImageId" TEXT,
    "closeDate" TIMESTAMP(3),
    "closeCause" TEXT,
    "successorCorporateNumber" TEXT,
    "changeCause" TEXT,
    "assignmentDate" TIMESTAMP(3) NOT NULL,
    "latest" INTEGER NOT NULL,
    "enName" TEXT,
    "enPrefectureName" TEXT,
    "enCityName" TEXT,
    "enAddressOutside" TEXT,
    "furigana" TEXT,
    "hihyoji" INTEGER NOT NULL,

    CONSTRAINT "CorporationNumberInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CorporationNumberInfo_corporateNumber_key" ON "CorporationNumberInfo"("corporateNumber");
