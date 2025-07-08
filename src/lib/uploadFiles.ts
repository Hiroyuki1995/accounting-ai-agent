import { PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import prisma from './prisma';
import { s3Client } from './s3';

const MINIO_BUCKET_NAME = process.env.MINIO_BUCKET_NAME!;

export async function uploadFilesToMinioAndDb(
  files: File[], // アップロードしたいファイル
  org_id: string,
) {
  const fileIds: number[] = [];
  const createdFiles = [];
  for (const file of files) {
    if (file.type !== 'application/pdf') {
      throw new Error('PDFファイルのみアップロード可能です。');
    }
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = file.name;
    const objectKey = 'uploads/' + uuidv4();

    const uploadCommand = new PutObjectCommand({
      Bucket: MINIO_BUCKET_NAME,
      Key: objectKey,
      Body: buffer,
      ContentType: file.type,
    });
    await s3Client.send(uploadCommand);

    const createdFile = await prisma.file.create({
      data: {
        file_name: fileName,
        object_key: objectKey,
        status: 'uploaded',
        orgId: org_id,
      }
    });

    createdFiles.push(createdFile);
    // await addFileProcessingJob(createdFile.id);
    fileIds.push(createdFile.id);
  }
  // return fileIds;
  return createdFiles;
}