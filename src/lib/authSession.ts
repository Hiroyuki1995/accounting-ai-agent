// セッションからユーザーメタ情報を取得する関数
import { auth0 } from "./auth0";

interface UserData {
  nickname: string,
  name: string,
  picture: string,
  email: string,
  email_verified: boolean,
  sub: string,
  org_id: string,
}

export const getUserData = async (): Promise<UserData | undefined> => {
  const session = await auth0.getSession();
  if(!session ||
    !session.user ||
    typeof session.user.nickname !== 'string' ||
    typeof session.user.name !== 'string' ||
    typeof session.user.picture !== 'string' ||
    typeof session.user.email !== 'string' ||
    typeof session.user.email_verified !== 'boolean' ||
    typeof session.user.sub !== 'string' ||
    typeof session.user.org_id !== 'string') {
    throw new Error('ユーザー情報の取得に失敗しました');
  }
  return session.user as UserData;
}