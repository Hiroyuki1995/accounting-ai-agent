import { AuthUser, withAuth } from '@/middleware/withAuth';
import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export const POST = withAuth(async (request: NextRequest, user: AuthUser) => {
  try {
    const { partnerData, bankAccounts } = await request.json();
    console.log('partnerData:', partnerData);
    const orgId = user.org_id;
    console.log('orgId', orgId);
    if (!orgId) {
      return NextResponse.json({ error: 'ユーザー情報の取得に失敗しました' }, { status: 500 });
    }

    const data = {
      ...partnerData,
      orgId: orgId,
      bankAccounts: {
        create: bankAccounts,
      },
    }

    console.log('data:', data);

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
    console.error("error:",error);
    return NextResponse.json({ error: '取引先の登録に失敗しました' }, { status: 500 });
  }
});

export const GET = withAuth(async (request: NextRequest, user: AuthUser) => {
  const orgId = user.org_id;
  if (!orgId) {
    return NextResponse.json({ error: 'ユーザー情報の取得に失敗しました' }, { status: 500 });
  }
  try {
    const partners = await prisma.partner.findMany({
      where: { orgId },
      include: {
        bankAccounts: true,
      },
    });
    return NextResponse.json(partners, { status: 200 });
  } catch (error) {
    console.error("error:",error);
    return NextResponse.json({ error: '取引先データの取得に失敗しました' }, { status: 500 });
  }
});