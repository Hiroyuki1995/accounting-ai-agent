'use client';

import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { UserItem, UserUpdateInfo } from './UserListPage';

interface UserEditDialogProps {
  open: boolean;
  onClose: () => void;
  user: UserItem | null;
  onUpdate: (user: UserUpdateInfo) => void;
}

export default function UserEditDialog({ open, onClose, user, onUpdate }: UserEditDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'STAFF'>('STAFF');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [departmentError, setDepartmentError] = useState('');
  const [roleError, setRoleError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setDepartment(user.app_metadata?.department || '');
      setRole(user.app_metadata?.role as 'ADMIN' | 'STAFF');
    }
  }, [user, open]);

  const handleUpdate = () => {
    let hasError = false;
    setNameError('');
    setEmailError('');
    setDepartmentError('');
    setRoleError('');
    if (!name) {
      setNameError('名前は必須です');
      hasError = true;
    }
    if (!email) {
      setEmailError('メールアドレスは必須です');
      hasError = true;
    }
    if (!department) {
      setDepartmentError('部署は必須です');
      hasError = true;
    }
    if (!role) {
      setRoleError('権限グループは必須です');
      hasError = true;
    }
    if (hasError || !user) return;
    onUpdate({ ...user, name, email, app_metadata: { ...user.app_metadata, department, role } });
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="xs" fullWidth>
      <DialogTitle>ユーザー更新</DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="名前" value={name} onChange={e => setName(e.target.value)} fullWidth required error={!!nameError} helperText={nameError} />
          <TextField label="メールアドレス" value={email} onChange={e => setEmail(e.target.value)} fullWidth required type="email" error={!!emailError} helperText={emailError} />
          <TextField label="部署" value={department} onChange={e => setDepartment(e.target.value)} fullWidth required error={!!departmentError} helperText={departmentError} />
          <TextField
            select
            label="権限グループ"
            value={role}
            onChange={e => setRole(e.target.value as 'ADMIN' | 'STAFF')}
            fullWidth
            required
            error={!!roleError}
            helperText={roleError}
          >
            <MenuItem value="ADMIN">管理者権限</MenuItem>
            <MenuItem value="STAFF">担当者権限</MenuItem>
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="secondary" variant="outlined">キャンセル</Button>
        <Button onClick={handleUpdate} color="primary" variant="contained">更新</Button>
      </DialogActions>
    </Dialog>
  );
} 