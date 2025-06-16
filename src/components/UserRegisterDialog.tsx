'use client';

import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from '@mui/material';
import { useState } from 'react';

interface UserRegisterDialogProps {
  open: boolean;
  onClose: () => void;
  onRegister: (user: { name: string; email: string; department: string; role: 'ADMIN' | 'STAFF' }) => void;
}

export default function UserRegisterDialog({ open, onClose, onRegister }: UserRegisterDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'STAFF'>('STAFF');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [departmentError, setDepartmentError] = useState('');
  const [roleError, setRoleError] = useState('');

  const handleRegister = () => {
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
    if (hasError) return;
    onRegister({ name, email, department, role });
    setName('');
    setEmail('');
    setDepartment('');
    setRole('STAFF');
    onClose();
  };

  const handleCancel = () => {
    setName('');
    setEmail('');
    setDepartment('');
    setRole('STAFF');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="xs" fullWidth>
      <DialogTitle>ユーザー登録</DialogTitle>
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
        <Button onClick={handleRegister} color="primary" variant="contained">登録</Button>
      </DialogActions>
    </Dialog>
  );
} 