import { GoogleGenAI, Type } from "@google/genai";
import { Job, Worker } from 'bullmq';
import dotenv from 'dotenv';
import Redis from 'ioredis';
import prisma from '../lib/prisma.js';

// .envファイルから環境変数を読み込む
dotenv.config();

// Redis接続設定 (queue.tsと共通)
const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  maxRetriesPerRequest: null,
});

// Gemini APIキーを環境変数から取得
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  console.error('GEMINI_API_KEY is not set in environment variables.');
  // APIキーがない場合のエラー処理
  // throw new Error('GEMINI_API_KEY is not set.');
}



// "fileProcessingQueue" のワーカーを作成
const worker = new Worker(
  'fileProcessingQueue', // キュー名
  async (job: Job) => {
    try {
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

    // ファイルIDを取得
    const fileId = job.data.fileId;

    // ファイルIDからobject_keyをDBから取得
    const objectKey = await prisma.file.findUnique({
      where: { id: fileId },
      select: { object_key: true },
    });

    // オブジェクトキーを基にファイルをminioから取得
    const minioFileUrl = `${process.env.NEXT_PUBLIC_MINIO_ENDPOINT}/${process.env.NEXT_PUBLIC_MINIO_BUCKET_NAME}/${objectKey?.object_key}`;
    // minioFileをbase64に変換
    const minioResponse = await fetch(minioFileUrl);
    const arrayBuffer = await minioResponse.arrayBuffer();
    const base64Pdf = Buffer.from(arrayBuffer).toString('base64');

    const contents = [
      {
        inlineData: {
          mimeType: "application/pdf",
          data: base64Pdf,
        },
      },
      {
        text: `
          以下のPDF請求書から、次の情報を抽出してください。

          抽出項目：
          - 発行元企業名 → issuer_name
          - 請求日 → invoice_date
          - 適格請求書登録番号 → registration_number
          - 8%税抜金額 → tax_8_base
          - 8%税額 → tax_8_amount
          - 8%税込金額 → tax_8_total
          - 10%税抜金額 → tax_10_base
          - 10%税額 → tax_10_amount
          - 10%税込金額 → tax_10_total
          - 合計税込金額 → total_amount
        `.trim(),
      },
    ];

    const config = {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          issuer_name: {
            type: Type.STRING,
          },
          invoice_date: {
            type: Type.STRING,
            format: "date-time", // ISO 8601形式の日付 (YYYY-MM-DD) を期待する場合
          },
          registration_number: {
            type: Type.STRING,
          },
          tax_8_base: {
            type: Type.INTEGER,
          },
          tax_8_amount: {
            type: Type.INTEGER,
          },
          tax_8_total: {
            type: Type.INTEGER,
          },
          tax_10_base: {
            type: Type.INTEGER,
          },
          tax_10_amount: {
            type: Type.INTEGER,
          },
          tax_10_total: {
            type: Type.INTEGER,
          },
          total_amount: {
            type: Type.INTEGER,
          },
        },
        propertyOrdering: ["issuer_name", "invoice_date", "registration_number", "tax_8_base", "tax_8_amount", "tax_8_total", "tax_10_base", "tax_10_amount", "tax_10_total", "total_amount"],
      },
    };

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: contents,
      config: config,
    });

    console.log("抽出結果:\n", response.text);
    console.log(`Processing job ${job.id} for file ID ${job.data.fileId}`);
    const json = JSON.parse(response.text || '{}');
    console.log(json);


    // ファイルステータスを「要確認」に更新し、抽出結果を保存

      await prisma.file.update({
        where: { id: fileId },
        data: {
          status: '要確認',
          issuer_name: json.issuer_name || null,
          invoice_date: json.invoice_date ? new Date(json.invoice_date) : null,
          registration_number: json.registration_number || null,
          tax_8_base: json.tax_8_base ? BigInt(json.tax_8_base) : null,
          tax_8_amount: json.tax_8_amount ? BigInt(json.tax_8_amount) : null,
          tax_8_total: json.tax_8_total ? BigInt(json.tax_8_total) : null,
          tax_10_base: json.tax_10_base ? BigInt(json.tax_10_base) : null,
          tax_10_amount: json.tax_10_amount ? BigInt(json.tax_10_amount) : null,
          tax_10_total: json.tax_10_total ? BigInt(json.tax_10_total) : null,
          total_amount: json.total_amount ? BigInt(json.total_amount) : null,
        },
      });
      console.log(`File ID ${fileId} status updated to '要確認' and data saved.`);
    } catch (error) {
      console.error(error);
      // エラー処理 (リトライなど BullMQの機能で可能)
      throw error; // ジョブをFailed状態にする
    }
  },
  { connection }
);

worker.on('completed', job => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed with error ${err.message}`);
});

// ワーカーの開始 (このファイルをimportすれば自動で開始される)
console.log('File processing worker started.');

// Next.js開発モードでのホットリロード対策 (任意)
if (process.env.NODE_ENV === 'development') {
  // ここにワーカーのクリーンアップ処理などを記述することがありますが、
  // シンプルな場合は特に必要ないことも多いです。
} 