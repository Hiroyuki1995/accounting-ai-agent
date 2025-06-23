import { orgIdMiddleware } from '@/middleware/orgIdMiddleware';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export const POST = orgIdMiddleware(async (request: Request) => {
  try {
    const { partnerData, bankAccounts } = await request.json();
    const orgId = (request as any).orgId;
    console.log(partnerData);
    console.log(bankAccounts);

    const partner = await prisma.partner.create({
      data: {
        ...partnerData,
        orgId: orgId,
        bankAccounts: {
          create: bankAccounts,
        },
      },
    });

    return NextResponse.json(partner, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '取引先の登録に失敗しました' }, { status: 500 });
  }
});

export const GET = orgIdMiddleware(async (request: Request) => {
  const orgId = (request as any).orgId;
  try {
    const partners = await prisma.partner.findMany({
      where: { orgId },
      include: {
        bankAccounts: true,
      },
    });
    return NextResponse.json(partners, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '取引先データの取得に失敗しました' }, { status: 500 });
  }
});