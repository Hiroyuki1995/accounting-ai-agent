import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import AccountRegisterDialog from './AccountRegisterDialog';

type Account = {
  alias: string;
  bank: string;
  branch: string;
  type: string;
  number: string;
  holder: string;
};

export default function AccountListPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [registerOpen, setRegisterOpen] = useState(false);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get('/api/accounts');
      setAccounts(response.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };
  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleRegister = async (account: Omit<Account, 'id'>) => {
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(account),
      });
      if (res.status === 201) {
        await fetchAccounts();
      }
    } catch (error) {
      console.error('Error registering account:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          自社口座管理
        </Typography>
        <Button variant="contained" color="primary" onClick={() => setRegisterOpen(true)}>
          口座登録
        </Button>
      </Box>
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader aria-label="account list table">
            <TableHead>
              <TableRow>
                <TableCell>通称</TableCell>
                <TableCell>銀行</TableCell>
                <TableCell>支店</TableCell>
                <TableCell>預金種目</TableCell>
                <TableCell>口座番号</TableCell>
                <TableCell>口座名義人</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts.map((account, index) => (
                <TableRow key={index}>
                  <TableCell>{account.alias}</TableCell>
                  <TableCell>{account.bank}</TableCell>
                  <TableCell>{account.branch}</TableCell>
                  <TableCell>{account.type}</TableCell>
                  <TableCell>{account.number}</TableCell>
                  <TableCell>{account.holder}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <AccountRegisterDialog
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onRegister={handleRegister}
      />
    </Box>
  );
} 