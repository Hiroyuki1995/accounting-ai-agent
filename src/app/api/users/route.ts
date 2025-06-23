import { getManagementApiToken } from '@/lib/auth0';
import { orgIdMiddleware } from '@/middleware/orgIdMiddleware';
import { ManagementClient } from 'auth0';
import { NextResponse } from 'next/server';

export const GET = orgIdMiddleware(async (request: Request) => {
  try {
    const token = await getManagementApiToken();
    const auth0 = new ManagementClient({
      domain: process.env.AUTH0_DOMAIN || '',
      token: token,
    });
    const orgId = (request as any).orgId;
    console.log('orgId', orgId);

    const users = await auth0.users.getAll({
      q: `app_metadata.org_id:"${orgId}"`,
    });

    return NextResponse.json(users.data, { status: 200 });
  } catch (error) {
    console.error('Error fetching users from Auth0:', error);
    return NextResponse.json({ error: 'ユーザー一覧の取得に失敗しました' }, { status: 500 });
  }
});