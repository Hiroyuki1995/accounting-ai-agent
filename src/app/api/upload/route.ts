import prisma from '@/lib/prisma';

import { addFileProcessingJob } from '@/lib/queue';
// import { writeFile } from 'fs/promises'; // ローカルファイル保存は不要になるため削除
import { NextResponse } from 'next/server';
// import { join } from 'path'; // ローカルファイル保存は不要になるため削除
import { orgIdMiddleware } from '@/middleware/orgIdMiddleware';
import { CreateBucketCommand, ListBucketsCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'; // S3クライアントをインポート
import { v4 as uuidv4 } from 'uuid'; // uuidv4をインポート

// MinIO接続用のS3クライアントを設定
const s3Client = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT, // .env.localから取得
  region: "us-east-1", // MinIOではリージョンは必須ではないが、設定が必要な場合がある
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY!, // .env.localから取得
    secretAccessKey: process.env.MINIO_SECRET_KEY!, // .env.localから取得
  },
  forcePathStyle: true, // MinIOには必須
});

const MINIO_BUCKET_NAME = process.env.MINIO_BUCKET_NAME!;

// バケットが存在するか確認し、なければ作成する関数
async function ensureBucketExists(bucketName: string) {
  try {
    await s3Client.send(new ListBucketsCommand({}));
    // バケットリストの取得に成功しても、目的のバケットがあるかは別途確認が必要だが、
    // CreateBucketCommandは冪等性があるため、シンプルに作成を試みる
    // 存在する場合はエラーになるが無視できる
    await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
  } catch (error: unknown) {
    console.error(error)
    // unknown型のエラーからメッセージを取得するには型ガードが必要
    if (error instanceof Error) {
      console.error('Error ensuring bucket exists (may be expected if bucket already exists):', error.message);
    } else {
      console.error('An unknown error occurred while ensuring bucket exists', error);
    }
  }
}

export const POST = orgIdMiddleware(async (request: Request) => {
  try {
    // バケットの存在を確認・作成
    await ensureBucketExists(MINIO_BUCKET_NAME);
    const orgId = (request as any).orgId;
    console.log('orgId', orgId);

    const formData = await request.formData();
    const files = formData.getAll('file') as File[];
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'ファイルが見つかりません。' },
        { status: 400 }
      );
    }

    for (const file of files) {
      // ファイルタイプを検証 (PDFのみ許可)
      if (file.type !== 'application/pdf') {
        console.warn(`Attempted to upload non-PDF file: ${file.name} (${file.type})`);
        return NextResponse.json(
          { error: 'PDFファイルのみアップロード可能です。' },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      // const timestamp = Date.now(); // 未使用のため削除
      // MinIOに保存する際のオブジェクトキー (パス) を生成
      const fileName = file.name;
      // object_keyはUUIDにする
      const objectKey = 'uploads/' + uuidv4();

      // MinIOにファイルをアップロード
      const uploadCommand = new PutObjectCommand({
        Bucket: MINIO_BUCKET_NAME,
        Key: objectKey,
        Body: buffer,
        ContentType: file.type, // ファイルタイプを設定
      });

      await s3Client.send(uploadCommand);

      // ローカルファイル保存処理は削除
      // const uploadDir = join(process.cwd(), 'public', 'uploads');
      // const filePath = join(uploadDir, fileName);
      // await writeFile(filePath, buffer);
      // uploadedNames.push(fileName);

      // DBにINSERTし、挿入されたレコードを取得
      const createdFile = await prisma.file.create({
        data: {
          file_name: fileName, // ファイル名は元の名前をDBに保存
          object_key: objectKey, // MinIOでのパスをDBに保存 (file_pathから変更)
          status: 'uploaded', // 初期ステータス
          orgId: orgId,
        }
      });

      // BullMQキューにジョブを追加 (ファイルIDを渡す)
      await addFileProcessingJob(createdFile.id);
    }

    // 成功時のレスポンスを修正 (ファイル名は元の名前のリストを返す)
    return NextResponse.json(
      { message: 'ファイルのアップロードが完了しました。', files: files.map(f => f.name) },
      { status: 200 }
    );
  } catch (error: unknown) {
    // unknown型のエラーからメッセージを取得するには型ガードが必要
    if (error instanceof Error) {
      console.error('Error uploading file to MinIO or DB:', error.message);
    } else {
      console.error('An unknown error occurred during file upload', error);
    }
    return NextResponse.json(
      { error: 'ファイルのアップロード中にエラーが発生しました。' },
      { status: 500 }
    );
  }
});