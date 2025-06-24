import { PrismaClient } from '@prisma/client';
import csv from 'csv-parser';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const results: any[] = [];

  fs.createReadStream('prisma/corporations.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      for (const row of results) {
        await prisma.corporation.create({
          data: {
            sequenceNumber: parseInt(row.sequenceNumber, 10),
            registratedNumber: row.registratedNumber,
            process: parseInt(row.process, 10),
            correct: parseInt(row.correct, 10),
            kind: parseInt(row.kind, 10),
            country: parseInt(row.country, 10),
            latest: parseInt(row.latest, 10),
            registrationDate: new Date(row.registrationDate),
            updateDate: new Date(row.updateDate),
            address: row.address,
            addressPrefectureCode: parseInt(row.addressPrefectureCode, 10),
            addressCityCode: parseInt(row.addressCityCode, 10),
          },
        });
      }
      await prisma.$disconnect();
    });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


