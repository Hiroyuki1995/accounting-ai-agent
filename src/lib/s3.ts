import { S3Client } from '@aws-sdk/client-s3'; // S3クライアントをインポート


// MinIO接続用のS3クライアントを設定
export const s3Client = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT, // .env.localから取得
  region: "us-east-1", // MinIOではリージョンは必須ではないが、設定が必要な場合がある
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY!, // .env.localから取得
    secretAccessKey: process.env.MINIO_SECRET_KEY!, // .env.localから取得
  },
  forcePathStyle: true, // MinIOには必須
});