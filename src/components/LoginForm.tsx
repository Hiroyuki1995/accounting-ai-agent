'use client';

import Image from 'next/image';
import { useState } from 'react';
// import styles from './LoginForm.module.css'; // CSSモジュールを削除

import { Alert, Box, Button, Link as MuiLink, TextField } from '@mui/material';

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId || !password) {
      setError('ログインIDとパスワードを入力してください');
      return;
    }
    setError('');
    onLoginSuccess();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f4f6f8', // 背景色
      }}
    >
      <Box
        sx={{
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: 3,
          padding: 4,
          width: '100%',
          maxWidth: 400,
          textAlign: 'center',
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Image src="/logo-1stop.svg" alt="1stop Payment ロゴ" width={180} height={40} />
        </Box>
        <Box component="form" onSubmit={handleSubmit} autoComplete="off">
          <TextField
            margin="normal"
            required
            fullWidth
            id="loginId"
            label="ログインID"
            name="loginId"
            autoComplete="username"
            autoFocus
            value={loginId}
            onChange={e => setLoginId(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="パスワード"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 1 }}>
              {error}
            </Alert>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            ログイン
          </Button>
        </Box>
        <Box sx={{ mt: 2 }}>
          <MuiLink href="#" variant="body2">
            ログインID・パスワードをお忘れの方はこちら
          </MuiLink>
        </Box>
      </Box>
    </Box>
  );
} 