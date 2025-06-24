import { getAuth0ManagementClient } from '@/lib/auth0';
import { getUserData } from '@/lib/authSession';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const userData = await getUserData();
    const orgId = userData?.org_id;
    if (!orgId) {
      return NextResponse.json({ error: 'ユーザー情報の取得に失敗しました' }, { status: 500 });
    }

    const auth0Management = await getAuth0ManagementClient();
    const users = await auth0Management.users.getAll({
      q: `app_metadata.org_id:"${orgId}"`,
    });

    return NextResponse.json(users.data, { status: 200 });
  } catch (error) {
    console.error('Error fetching users from Auth0:', error);
    return NextResponse.json({ error: 'ユーザー一覧の取得に失敗しました' }, { status: 500 });
  }
}