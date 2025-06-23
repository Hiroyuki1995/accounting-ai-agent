// src/middleware/orgIdMiddleware.ts
import { NextResponse } from 'next/server';
import { auth0 } from "./../lib/auth0";

export const orgIdMiddleware = (handler: Function) => {
  return async (req: Request) => {
    try {
      const session = await auth0.getSession();
  
      if (!session) {
        return NextResponse.json({ error: 'Session cookie not found' }, { status: 400 });
      }

      const orgId = session?.user?.org_id || '';
      if (!orgId) {
        return NextResponse.json({ error: 'org_id not found in session token' }, { status: 400 });
      }

      // // リクエストオブジェクトにorg_idを追加
      (req as any).orgId = orgId;

      // 次のハンドラーを呼び出す
      return handler(req);
    } catch (error) {
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  };
};