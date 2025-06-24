import prisma from '@/lib/prisma';
import { AuthUser, withAuth } from '@/middleware/withAuth';
import { NextRequest, NextResponse } from 'next/server';

// 口座登録
export const POST = withAuth(async (request: NextRequest, user: AuthUser) => {
  const { alias, bank, branch, type, number, holder } = await request.json();
  const orgId = user.org_id;
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
  })

// 口座取得
export const GET = withAuth(async (request: NextRequest, user: AuthUser) => {
  const orgId = user.org_id;
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
});