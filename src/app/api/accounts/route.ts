import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// 口座登録
export async function POST(req: Request) {
  const { alias, bank, branch, type, number, holder } = await req.json();

    try {
      const newAccount = await prisma.account.create({
        data: {
          alias,
          bank,
          branch,
          type,
          number,
          holder,
        },
      });
      return NextResponse.json(newAccount, { status: 201 });
    } catch (error) {
      return NextResponse.json({ error: 'ユーザー登録に失敗しました' }, { status: 500 });
    }
}

// 口座取得
export async function GET() {
  try {
    const accounts = await prisma.account.findMany();
    return NextResponse.json(accounts, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: '口座情報の取得に失敗しました' }, { status: 500 });
  }
}