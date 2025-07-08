import prisma from '@/lib/prisma';
import { uploadFilesToMinioAndDb } from '@/lib/uploadFiles';
import { AuthUser, withAuth } from '@/middleware/withAuth';
import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from 'next/server';

// BigIntをJSONにシリアライズできるようにする
// https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/BigInt/toJSON
declare global {
  interface BigInt {
    toJSON(): string;
  }
}
BigInt.prototype.toJSON = function () {
  return this.toString();
};

export const GET = withAuth(async (request: NextRequest, user: AuthUser) => {
  const orgId = user.org_id;
  if (!orgId) {
    return NextResponse.json({ error: 'ユーザー情報の取得に失敗しました' }, { status: 500 });
  }
  try {
    const files = await prisma.file.findMany({
      where: { orgId },
      orderBy: {
        uploaded_at: 'desc',
      },
    });
    return NextResponse.json(files);

  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'ファイル一覧の取得に失敗しました。' },
      { status: 500 }
    );
  }
});

// アップロードしたファイルをオンラインでGeminiのOCRを使いその結果を返却する
export const POST = withAuth(async (request: NextRequest, user: AuthUser) => {
  try {
    
    // await ensureBucketExists(MINIO_BUCKET_NAME);
    const orgId = user.org_id;
    if (!orgId) {
      return NextResponse.json({ error: 'ユーザー情報の取得に失敗しました' }, { status: 500 });
    }
    

    const formData = await request.formData();
    const files = formData.getAll('file') as File[];
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'ファイルが見つかりません。' },
        { status: 400 }
      );
    }
    const createdFiles = await uploadFilesToMinioAndDb(files,orgId);

    const responseFiles = createdFiles.map((file, index) => ({
      name: file.file_name,
      id: file.id,
    }));
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
    // 1ファイルごとにAIOCRを実行
    for (const file of createdFiles) {
      // オブジェクトキーを基にファイルをminioから取得
      const minioFileUrl = `${process.env.NEXT_PUBLIC_MINIO_ENDPOINT}/${process.env.NEXT_PUBLIC_MINIO_BUCKET_NAME}/${file.object_key}`;
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
        model: "gemini-2.5-flash",
        contents: contents,
        config: config,
      });

      const json = JSON.parse(response.text || '{}');


      // ファイルステータスを「要確認」に更新し、抽出結果を保存

      await prisma.file.update({
        where: { id: file.id },
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
    }

    const registerdFiles = await prisma.file.findMany({
      where: { id: { in: createdFiles.map(file => file.id) } }, // id全て
      orderBy: {
        uploaded_at: 'desc',
      },
    });

    // 成功時のレスポンスを修正 (ファイル名とIDのリストを返す)
    return NextResponse.json(
      { 
        message: 'ファイルのアップロードが完了しました。',
        files: registerdFiles, // ファイル名とIDを含むオブジェクトのリストを返す
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    // unknown型のエラーからメッセージを取得するには型ガードが必要
    if (error instanceof Error) {
      console.error('Error uploading file to MinIO or DB:', error);
    } else {
      console.error('An unknown error occurred during file upload', error);
    }
    return NextResponse.json(
      { error: 'ファイルのアップロード中にエラーが発生しました。' },
      { status: 500 }
    );
  }
});