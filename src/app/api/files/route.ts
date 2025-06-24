import prisma from '@/lib/prisma';
import { AuthUser, withAuth } from '@/middleware/withAuth';
import { NextRequest, NextResponse } from 'next/server';

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

export const GET = withAuth(async (request: NextRequest, user: AuthUser) => {
  const orgId = user.org_id;
  if (!orgId) {
    return NextResponse.json({ error: 'ユーザー情報の取得に失敗しました' }, { status: 500 });
  }
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