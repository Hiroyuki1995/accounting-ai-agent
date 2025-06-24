import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "./lib/auth0";

const API_KEY_HEADER = "x-api-key";
interface UserData {
  sub: string,
  org_id: string,
}

// 画面へのリクエスト・APIへのリクエストの両方をハンドリングする
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isApiRequest = pathname.startsWith("/api");

  if (isApiRequest) {
    // APIリクエスト時の処理
    try {
      const session = await auth0.getSession();
      // console.log('session', session);
      const response = NextResponse.next();
      // Auth0のセッション情報がある場合
      if (session?.user && session.user.sub && session.user.org_id) {
        console.debug('Auth0認証済み');
        response.headers.set('x-auth-method', 'auth0');
        return response; // 認証済み
      }

      // APIキー認証（セッションがない場合）
      const apiKey = request.headers.get(API_KEY_HEADER);
      // ここではAPIキーの存在を確認するだけ。認証はしない。認証はAPI側でラップしたmiddlewareで行う。
      if(apiKey) {
        response.headers.set('x-auth-method', 'api-key');
        return response;
      }
      // 認証情報が存在しない場合
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    } catch (err) {
      console.error('error', err);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  try {
    return await auth0.middleware(request); // 認証チェック。未認証の場合は、ログインページにリダイレクトさせる
  } catch (error) {
    console.error('error', error);
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};