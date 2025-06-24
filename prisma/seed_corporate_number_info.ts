import { PrismaClient } from '@prisma/client';
import csv from 'csv-parser';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const results: any[] = [];
  
  fs.createReadStream('prisma/13_tokyo_all_20250530.csv')
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        for (const row of results) {
          await prisma.corporationNumberInfo.create({
            data: {
              sequenceNumber: parseInt(row.sequenceNumber, 10),
              corporateNumber: row.corporateNumber,
              process: parseInt(row.process, 10),
              correct: parseInt(row.correct, 10),
              updateDate: new Date(row.updateDate),
              changeDate: row.changeDate ? new Date(row.changeDate) : null,
              name: row.name,
              nameImageId: row.nameImageId,
              kind: parseInt(row.kind, 10),
              prefectureName: row.prefectureName,
              cityName: row.cityName,
              streetNumber: row.streetNumber,
              addressImageId: row.addressImageId,
              prefectureCode: parseInt(row.prefectureCode, 10),
              cityCode: parseInt(row.cityCode, 10),
              postCode: row.postCode,
              addressOutside: row.addressOutside,
              addressOutsideImageId: row.addressOutsideImageId,
              closeDate: row.closeDate ? new Date(row.closeDate) : null,
              closeCause: row.closeCause,
              successorCorporateNumber: row.successorCorporateNumber,
              changeCause: row.changeCause,
              assignmentDate: new Date(row.assignmentDate),
              latest: parseInt(row.latest, 10),
              enName: row.enName,
              enPrefectureName: row.enPrefectureName,
              enCityName: row.enCityName,
              enAddressOutside: row.enAddressOutside,
              furigana: row.furigana,
              hihyoji: parseInt(row.hihyoji, 10),
            },
          });
        }
      });

      await prisma.$disconnect();
    }


main().catch((e) => {
  console.error(e);
  process.exit(1);
});


