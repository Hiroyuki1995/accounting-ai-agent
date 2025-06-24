import prisma from '@/lib/prisma';
import { AuthUser, withAuth } from '@/middleware/withAuth';
import { NextRequest, NextResponse } from 'next/server';

// 法人情報取得
export const GET = withAuth(async (req: NextRequest, user: AuthUser) => {
  const { searchParams } = new URL(req.url);
  const corporateNumber = searchParams.get('corporateNumber');

  if (!corporateNumber) {
    return NextResponse.json({ error: '登録番号が指定されていません' }, { status: 400 });
  }

  try {
    const corporationInvoiceInfos = await prisma.corporation.findMany({
      where: { registratedNumber: `T${corporateNumber}` },
    });
    const corporationNumberInfos = await prisma.corporationNumberInfo.findMany({
      where: { corporateNumber: corporateNumber },
    });

    if (!corporationInvoiceInfos && !corporationNumberInfos) {
      return NextResponse.json({ error: '法人情報が見つかりません' }, { status: 404 });
    }

    const corporation = {
      corporateInvoiceInfo: corporationInvoiceInfos[0],
      corporateNumberInfo: corporationNumberInfos[0]
    };

    return NextResponse.json(corporation, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: '法人情報の取得に失敗しました' }, { status: 500 });
  }
});