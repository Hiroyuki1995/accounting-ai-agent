import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// ユーザー一覧取得
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { id: 'asc' },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'ユーザー一覧の取得に失敗しました' }, { status: 500 });
  }
}

// ユーザー登録
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, department, role } = body;
    if (!name || !email || !department || !role) {
      return NextResponse.json({ error: '全ての項目が必須です' }, { status: 400 });
    }
    if (role !== 'ADMIN' && role !== 'STAFF') {
      return NextResponse.json({ error: '権限はADMINまたはSTAFFで指定してください' }, { status: 400 });
    }
    const user = await prisma.user.create({
      data: { name, email, department, role },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'ユーザー登録に失敗しました' }, { status: 500 });
  }
} 