'use client';

// import FileListPage from '../components/FileListPage'; // FileListPageはファイル一覧ページに移動
import LoginForm from '../../components/LoginForm';

export default function LoginPage() {
  // const [isLoggedIn, setIsLoggedIn] = useState(false); // ログイン状態の管理は不要

  return (
    // isLoggedIn ? (
    //   <FileListPage />
    // ) : (
    <LoginForm onLoginSuccess={() => {
      // ログイン成功後の処理（例: /files へのリダイレクト）
      console.log('Login successful, redirecting...');
      // TODO: /files へのリダイレクト処理を追加
      window.location.href = '/file'; // 例として直接リダイレクト
    }} />
    // )
  );
}
