'use client';

import { Box, Button, Checkbox, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import UserEditDialog from './UserEditDialog';
import UserRegisterDialog from './UserRegisterDialog';

// ユーザー情報の型
interface UserItem {
  id: number;
  name: string;
  email: string;
  department: string;
  role: 'ADMIN' | 'STAFF';
}

export default function UserListPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

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
  const handleRegister = async (user: Omit<UserItem, 'id'>) => {
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

  const handleUpdate = async (user: UserItem) => {
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      if (res.ok) {
        await fetchUsers();
      }
    } catch (e) { }
    setEditOpen(false);
  };

  const handleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(users.map(u => u.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) return;
    if (users.length - selectedIds.length < 1) {
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
                  <TableRow key={user.id} hover style={{ cursor: 'pointer' }} onClick={() => handleRowClick(user)}>
                    <TableCell padding="checkbox" onClick={e => { e.stopPropagation(); handleSelect(user.id); }}>
                      <Checkbox checked={selectedIds.includes(user.id)} />
                    </TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell>{user.role === 'ADMIN' ? '管理者権限' : user.role === 'STAFF' ? '担当者権限' : ''}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <UserRegisterDialog
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onRegister={handleRegister}
      />
      <UserEditDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        user={selectedUser}
        onUpdate={handleUpdate}
      />
    </Box>
  );
} 