import { getUserData } from '@/lib/authSession';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// 口座登録
export async function POST(request: Request) {
  const { alias, bank, branch, type, number, holder } = await request.json();
  const userData = await getUserData();
  const orgId = userData?.org_id;
  if (!orgId) {
    return NextResponse.json({ error: 'ユーザー情報の取得に失敗しました' }, { status: 500 });
  }
    try {
      const newAccount = await prisma.account.create({
        data: {
          alias,
          bank,
          branch,
          type,
          number,
          holder,
          orgId: orgId,
        },
      });
      return NextResponse.json(newAccount, { status: 201 });
    } catch (error) {
      return NextResponse.json({ error: 'ユーザー登録に失敗しました' }, { status: 500 });
    }
  }

// 口座取得
export async function GET(request: Request) {
  const userData = await getUserData();
  const orgId = userData?.org_id;
  if (!orgId) {
    return NextResponse.json({ error: 'ユーザー情報の取得に失敗しました' }, { status: 500 });
  }
  try {
    const accounts = await prisma.account.findMany({
      where: { orgId },
    });
    return NextResponse.json(accounts, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: '口座情報の取得に失敗しました' }, { status: 500 });
  }
}