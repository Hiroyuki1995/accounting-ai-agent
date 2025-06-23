import { getManagementApiToken } from '@/lib/auth0';
import { ManagementClient } from 'auth0';
import { NextResponse } from 'next/server';

export async function PUT(req: Request) {
  try {
    const url = new URL(req.url);
    const id = decodeURIComponent(url.pathname.split('/').pop() || ''); // URLからIDを取得
    if (!id) {
      return NextResponse.json({ error: '不正なIDです' }, { status: 400 });
    }
    const userId = Number(id);
    // リクエストボディを取得
    const body = await req.json();
    console.log("body", body);
    const { name, email, app_metadata: { department, role } } = body;
    if (!name || !email || !department || !role) {
      return NextResponse.json({ error: '全ての項目が必須です' }, { status: 400 });
    }
    if (role !== 'ADMIN' && role !== 'STAFF') {
      return NextResponse.json({ error: '権限はADMINまたはSTAFFで指定してください' }, { status: 400 });
    }
    const token = await getManagementApiToken();
    const auth0 = new ManagementClient({
      domain: process.env.AUTH0_DOMAIN || '',
      token: token,
    });

    // Auth0のユーザー情報を更新する
    const user = await auth0.users.update(
      { id: id },
      body as any
    );
    console.log(user);
    return NextResponse.json(user.data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'ユーザー更新に失敗しました' }, { status: 500 });
  }
}