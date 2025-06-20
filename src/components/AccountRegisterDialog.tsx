import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { useState } from 'react';

interface AccountRegisterDialogProps {
  open: boolean;
  onClose: () => void;
  onRegister: (account: { alias: string; bank: string; branch: string; type: string; number: string; holder: string }) => void;
}

export default function AccountRegisterDialog({ open, onClose, onRegister }: AccountRegisterDialogProps) {
  const [alias, setAlias] = useState('');
  const [bank, setBank] = useState('');
  const [branch, setBranch] = useState('');
  const [type, setType] = useState('');
  const [number, setNumber] = useState('');
  const [holder, setHolder] = useState('');
  const [aliasError, setAliasError] = useState('');
  const [bankError, setBankError] = useState('');
  const [branchError, setBranchError] = useState('');
  const [typeError, setTypeError] = useState('');
  const [numberError, setNumberError] = useState('');
  const [holderError, setHolderError] = useState('');

  const handleRegister = () => {
    let hasError = false;
    setAliasError('');
    setBankError('');
    setBranchError('');
    setTypeError('');
    setNumberError('');
    setHolderError('');
    if (!alias) {
      setAliasError('通称は必須です');
      hasError = true;
    }
    if (!bank) {
      setBankError('銀行は必須です');
      hasError = true;
    }
    if (!branch) {
      setBranchError('支店は必須です');
      hasError = true;
    }
    if (!type) {
      setTypeError('預金種目は必須です');
      hasError = true;
    }
    if (hasError) return;
    onRegister({ alias, bank, branch, type, number, holder });
    setAlias('');
    setBank('');
    setBranch('');
    setType('');
    setNumber('');
    setHolder('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>口座登録</DialogTitle>
      <DialogContent>
        <TextField margin="dense" label="通称" name="alias" fullWidth variant="outlined" value={alias} onChange={e => setAlias(e.target.value)} />
        <TextField margin="dense" label="銀行" name="bank" fullWidth variant="outlined" value={bank} onChange={e => setBank(e.target.value)} />
        <TextField margin="dense" label="支店" name="branch" fullWidth variant="outlined" value={branch} onChange={e => setBranch(e.target.value)} />
        <TextField margin="dense" label="預金種目" name="type" fullWidth variant="outlined" value={type} onChange={e => setType(e.target.value)} />
        <TextField margin="dense" label="口座番号" name="number" fullWidth variant="outlined" value={number} onChange={e => setNumber(e.target.value)} />
        <TextField margin="dense" label="口座名義人" name="holder" fullWidth variant="outlined" value={holder} onChange={e => setHolder(e.target.value)} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          キャンセル
        </Button>
        <Button onClick={handleRegister} color="primary">
          登録
        </Button>
      </DialogActions>
    </Dialog>
  );
} 