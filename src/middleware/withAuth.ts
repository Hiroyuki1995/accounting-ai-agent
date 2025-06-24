import { auth0 } from "@/lib/auth0";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const API_KEY_HEADER = "x-api-key";

export interface AuthUser {
  sub: string;
  org_id: string;
}

// HOF: APIハンドラをラップして認証を強制
export function withAuth(handler: (req: NextRequest, user: AuthUser) => Promise<Response>) {
  return async function (req: NextRequest) {
    try {
      // Auth0セッションを確認
      const session = await auth0.getSession();
      if (session?.user?.sub && session?.user?.org_id) {
        return handler(req, {
          sub: session.user.sub,
          org_id: session.user.org_id,
        });
      }

      // APIキー認証 fallback
      const apiKey = req.headers.get(API_KEY_HEADER);
      if (apiKey) {
        const user = await prisma.user.findUnique({
          where: { api_key: apiKey },
        });
        if (user) {
          return handler(req, {
            sub: user.sub,
            org_id: user.org_id,
          });
        }
      }

      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    } catch (err) {
      console.error("認証エラー:", err);
      return NextResponse.json({ error: "認証エラー" }, { status: 401 });
    }
  };
}
