import prisma from '@/lib/prisma';
import { orgIdMiddleware } from '@/middleware/orgIdMiddleware';
import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

interface UpdateFileBody {
  issuer_name?: string | null;
  invoice_date?: string | null;
  registration_number?: string | null;
  tax_8_base?: string | null;
  tax_8_amount?: string | null;
  tax_8_total?: string | null;
  tax_10_base?: string | null;
  tax_10_amount?: string | null;
  tax_10_total?: string | null;
  total_amount?: string | null;
}

export const GET = orgIdMiddleware(async (req: Request) => {
  const url = new URL(req.url);
  const pathSegments = url.pathname.split('/');
  const id = pathSegments[pathSegments.length - 1]; // パスからidを取得
  console.log('id', id);

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }
  try {
    const fileId = parseInt(id, 10);

    if (isNaN(fileId)) {
        return NextResponse.json(
            { error: '無効なファイルIDです。' },
            { status: 400 }
        );
    }

    const file = await prisma.file.findUnique({
      where: {
        id: fileId,
      },
      select: {
        id: true,
        file_name: true,
        uploaded_at: true,
        status: true,
        object_key: true,
        issuer_name: true,
        invoice_date: true,
        registration_number: true,
        tax_8_base: true,
        tax_8_amount: true,
        tax_8_total: true,
        tax_10_base: true,
        tax_10_amount: true,
        tax_10_total: true,
        total_amount: true,
      },
    });

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが見つかりませんでした。' },
        { status: 404 }
      );
    }

    return NextResponse.json(file);
  } catch (error) {
    console.error('Error fetching file details:', error);
    return NextResponse.json(
      { error: 'ファイル詳細の取得に失敗しました。' },
      { status: 500 }
    );
  }
});

export const PUT = orgIdMiddleware(async (req: Request) => {
  const url = new URL(req.url);
  const pathSegments = url.pathname.split('/');
  const id = pathSegments[pathSegments.length - 1]; // パスからidを取得
  console.log('id', id);
  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }
  try {
    const fileId = parseInt(id, 10);
    if (isNaN(fileId)) {
      return NextResponse.json(
        { error: '無効なファイルIDです。' },
        { status: 400 }
      );
    }

    const body: UpdateFileBody = await req.json();

    // 更新対象のフィールドを抽出
    const updateData: Prisma.FileUpdateInput = {
        status: '確認済み',
    };

    if (body.issuer_name !== undefined) updateData.issuer_name = body.issuer_name;
    if (body.invoice_date !== undefined) updateData.invoice_date = body.invoice_date ? new Date(body.invoice_date) : null;
    if (body.registration_number !== undefined) updateData.registration_number = body.registration_number;
    if (body.tax_8_base !== undefined) updateData.tax_8_base = body.tax_8_base !== null ? BigInt(body.tax_8_base) : null;
    if (body.tax_8_amount !== undefined) updateData.tax_8_amount = body.tax_8_amount !== null ? BigInt(body.tax_8_amount) : null;
    if (body.tax_8_total !== undefined) updateData.tax_8_total = body.tax_8_total !== null ? BigInt(body.tax_8_total) : null;
    if (body.tax_10_base !== undefined) updateData.tax_10_base = body.tax_10_base !== null ? BigInt(body.tax_10_base) : null;
    if (body.tax_10_amount !== undefined) updateData.tax_10_amount = body.tax_10_amount !== null ? BigInt(body.tax_10_amount) : null;
    if (body.tax_10_total !== undefined) updateData.tax_10_total = body.tax_10_total !== null ? BigInt(body.tax_10_total) : null;
    if (body.total_amount !== undefined) updateData.total_amount = body.total_amount !== null ? BigInt(body.total_amount) : null;

    const updatedFile = await prisma.file.update({
      where: {
        id: fileId,
      },
      data: updateData,
      select: {
        id: true,
        file_name: true,
        uploaded_at: true,
        status: true,
        object_key: true,
        issuer_name: true,
        invoice_date: true,
        registration_number: true,
        tax_8_base: true,
        tax_8_amount: true,
        tax_8_total: true,
        tax_10_base: true,
        tax_10_amount: true,
        tax_10_total: true,
        total_amount: true,
      },
    });

    if (!updatedFile) {
      return NextResponse.json(
        { error: 'ファイルの更新に失敗しました。' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedFile);
  } catch (error) {
    console.error('Error updating file details:', error);
    return NextResponse.json(
      { error: 'ファイル情報の更新に失敗しました。' },
      { status: 500 }
    );
  }
});