import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = Number(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: '不正なIDです' }, { status: 400 });
    }
    const body = await req.json();
    const { name, email, department, role } = body;
    if (!name || !email || !department || !role) {
      return NextResponse.json({ error: '全ての項目が必須です' }, { status: 400 });
    }
    if (role !== 'ADMIN' && role !== 'STAFF') {
      return NextResponse.json({ error: '権限はADMINまたはSTAFFで指定してください' }, { status: 400 });
    }
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { name, email, department, role },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'ユーザー更新に失敗しました' }, { status: 500 });
  }
} 