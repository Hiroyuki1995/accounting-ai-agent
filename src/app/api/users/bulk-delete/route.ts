import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { ids } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: '削除対象がありません' }, { status: 400 });
    }
    // 現在のユーザー数を取得
    const total = await prisma.user.count();
    if (total - ids.length < 1) {
      return NextResponse.json({ error: '全てのユーザーを削除することはできません' }, { status: 400 });
    }
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'ユーザー削除に失敗しました' }, { status: 500 });
  }
} 