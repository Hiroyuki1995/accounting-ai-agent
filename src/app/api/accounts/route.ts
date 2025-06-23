import prisma from '@/lib/prisma';
import { orgIdMiddleware } from '@/middleware/orgIdMiddleware';
import { NextResponse } from 'next/server';

// 口座登録
export const POST = orgIdMiddleware(async (req: Request) => {
  const { alias, bank, branch, type, number, holder } = await req.json();
  const orgId = (req as any).orgId;
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
export const GET = orgIdMiddleware(async (request: Request) => {
  const orgId = (request as any).orgId;
  try {
    const accounts = await prisma.account.findMany({
      where: { orgId },
    });
    return NextResponse.json(accounts, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: '口座情報の取得に失敗しました' }, { status: 500 });
  }
});