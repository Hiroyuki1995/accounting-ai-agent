'use client';

import { Box, Button, Checkbox, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import UserEditDialog from './UserEditDialog';
// import UserRegisterDialog from './UserRegisterDialog';

// ユーザー参照情報の型
export interface UserItem {
  email: string;
  picture: string;
  email_verified: boolean;
  user_id: string;
  nickname: string;
  updated_at: string;
  user_metadata: Record<string, any>;
  identities: {
    connection: string;
    user_id: string;
    provider: string;
    isSocial: boolean;
  }[];
  name: string;
  created_at: string;
  last_login: string;
  last_ip: string;
  logins_count: number;
  app_metadata: {
    org_id: string;
    department: string;
    role: string;
  };
  blocked: boolean;
  phone_number: string;
  phone_verified: boolean;
  given_name: string;
  family_name: string;
  verify_email: boolean;
  verify_phone_number: boolean;
  password: string;
  verify_password: boolean;
  username: string;
}

// ユーザー登録・更新情報の型
export interface UserUpdateInfo {
  email: string;
  phone_number?: string;
  user_metadata?: Record<string, any>;
  blocked?: boolean;
  email_verified?: boolean;
  phone_verified?: boolean;
  app_metadata?: Record<string, any>;
  given_name?: string;
  family_name?: string;
  name: string;
  nickname?: string;
  picture?: string;
  user_id?: string;
  connection?: string;
  password?: string;
  verify_email?: boolean;
  username?: string;
  verify_phone_number?: boolean;
  verify_password?: boolean;
}

function mapUserItemToUpdateInfo(user: UserItem): UserUpdateInfo {
  return {
    email: user.email,
    name: user.name,
    username: user.username,
    // 必要に応じて他の共有属性をここに追加
    app_metadata: {
      department: user.app_metadata?.department || '',
      role: user.app_metadata?.role || '',
    },
  };
}

export default function UserListPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // ユーザー一覧をAPIから取得
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        setUsers([]);
      }
    } catch (e) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 新規登録時はAPI経由で追加
  const handleRegister = async (user: Omit<UserItem, 'user_id'>) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      if (res.ok) {
        await fetchUsers();
      }
    } catch (e) { }
  };

  const handleRowClick = (user: UserItem) => {
    setSelectedUser(user);
    setEditOpen(true);
  };

  const handleUpdate = async (user: UserUpdateInfo) => {
    const updateInfo = mapUserItemToUpdateInfo(user as UserItem);
    try {
      const res = await fetch(`/api/users/${user.user_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateInfo),
      });
      if (res.ok) {
        await fetchUsers();
      }
    } catch (e) { }
    setEditOpen(false);
  };

  const handleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(users.map(u => u.user_id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) return;
    if (users.length - selectedIds.length < 1) {
      // errorsnackbarでエラー画面表示
      alert('全てのユーザーを削除することはできません');
      return;
    }
    try {
      const res = await fetch('/api/users/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (res.ok) {
        await fetchUsers();
        setSelectedIds([]);
      } else {
        const data = await res.json();
        alert(data.error || '削除に失敗しました');
      }
    } catch (e) {
      alert('削除に失敗しました');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          ユーザー管理
        </Typography>
        <Box>
          <Button variant="contained" color="primary" onClick={() => setRegisterOpen(true)} sx={{ mr: 2 }}>
            ユーザー登録
          </Button>
          <Button variant="outlined" color="error" onClick={handleDelete} disabled={selectedIds.length === 0}>
            削除
          </Button>
        </Box>
      </Box>
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader aria-label="user list table">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedIds.length > 0 && selectedIds.length < users.length}
                    checked={users.length > 0 && selectedIds.length === users.length}
                    onChange={e => handleSelectAll(e.target.checked)}
                  />
                </TableCell>
                <TableCell>名前</TableCell>
                <TableCell>メールアドレス</TableCell>
                <TableCell>部署</TableCell>
                <TableCell>権限</TableCell>
                <TableCell>最終ログイン日時</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <CircularProgress size={24} sx={{ mr: 2 }} />
                    <Typography variant="body1">ユーザー一覧を取得中...</Typography>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body1" color="text.secondary">
                      ユーザーが登録されていません
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.user_id} hover style={{ cursor: 'pointer' }} onClick={() => handleRowClick(user)}>
                    <TableCell padding="checkbox" onClick={e => { e.stopPropagation(); handleSelect(user.user_id); }}>
                      <Checkbox checked={selectedIds.includes(user.user_id)} />
                    </TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.app_metadata.department}</TableCell>
                    <TableCell>{user.app_metadata.role}</TableCell>
                    <TableCell>{user.last_login}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      {/* <UserRegisterDialog
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onRegister={handleRegister}
      /> */}
      <UserEditDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        user={selectedUser}
        onUpdate={handleUpdate}
      />
    </Box>
  );
} 