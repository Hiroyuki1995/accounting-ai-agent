// Auth0 のクライアント設定・初期化ロジックをまとめた共通ユーティリティファイル
import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { ManagementClient } from 'auth0';

// Auth0のSPAクライアント
export const auth0 = new Auth0Client();

// Auth0の管理APIクライアントを取得する関数
export async function getAuth0ManagementClient() {
  const token = await getManagementApiToken();
  return new ManagementClient({
    domain: process.env.AUTH0_DOMAIN || '',
    token: token,
  });
}

// Auth0の管理API(Machine to Machine)クライアントのトークン取得(SDKでは用意されていないためスクラッチ)
async function getManagementApiToken() {
  const res = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
      client_secret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
      audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
    }),
  });

  const data = await res.json();
  return data.access_token;
}
