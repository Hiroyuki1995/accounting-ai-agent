import prisma from '@/lib/prisma';
import { orgIdMiddleware } from '@/middleware/orgIdMiddleware';
import { NextResponse } from 'next/server';

// BigIntをJSONにシリアライズできるようにする
// https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/BigInt/toJSON
declare global {
  interface BigInt {
    toJSON(): string;
  }
}
BigInt.prototype.toJSON = function () {
  return this.toString();
};

export const GET = orgIdMiddleware(async (request: Request) => {
  const orgId = (request as any).orgId;
  console.log('orgId', orgId);
  try {
    const files = await prisma.file.findMany({
      where: { orgId },
      orderBy: {
        uploaded_at: 'desc',
      },
    });
    return NextResponse.json(files);

  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'ファイル一覧の取得に失敗しました。' },
      { status: 500 }
    );
  }
});