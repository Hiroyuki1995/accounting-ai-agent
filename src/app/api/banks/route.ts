import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // クエリとして環境変数のapiKeyおよびlimit=2000を追加
    const apiKey = process.env.BANKCODEJP_API_KEY;
    const limit = 2000;
    const query = `apiKey=${apiKey}&limit=${limit}`;
    const response = await fetch(`https://apis.bankcode-jp.com/v3/banks?${query}`);
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
} 