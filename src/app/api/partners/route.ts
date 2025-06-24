import { getUserData } from '@/lib/authSession';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { partnerData, bankAccounts } = await request.json();
    const userData = await getUserData();
    const orgId = userData?.org_id;
    if (!orgId) {
      return NextResponse.json({ error: 'ユーザー情報の取得に失敗しました' }, { status: 500 });
    }

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
}

export async function GET(request: Request) {
  const userData = await getUserData();
  const orgId = userData?.org_id;
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
    console.error(error);
    return NextResponse.json({ error: '取引先データの取得に失敗しました' }, { status: 500 });
  }
}