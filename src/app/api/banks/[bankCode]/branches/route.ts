import { AuthUser, withAuth } from '@/middleware/withAuth';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withAuth(async (req: NextRequest, user: AuthUser) => {
  const url = new URL(req.url);
  const bankCode = url.pathname.split('/').slice(-2, -1)[0]; // URLからbankCodeを取得
  if (!bankCode) {
    return NextResponse.json({ error: '銀行コードが指定されていません' }, { status: 400 });
  }

  try {
    const apiKey = process.env.BANKCODEJP_API_KEY;
    const limit = 2000;
    const query = `apiKey=${apiKey}&limit=${limit}`;
    const response = await fetch(`https://apis.bankcode-jp.com/v3/banks/${bankCode}/branches?${query}`);
    if (!response.ok) {
      console.error(response);
      throw new Error('外部APIからのデータ取得に失敗しました');
    }
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'データの取得に失敗しました' }, { status: 500 });
  }
});