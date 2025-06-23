'use client';

import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import PartnerRegisterDialog from './PartnerRegisterDialog';

interface Partner {
  id: number;
  displayName: string;
  officialName: string;
  ocrName: string;
  companyNameKana: string;
  corporateNumber: string;
  invoiceRegistrationNumber: string;
  corporateType: string;
}


export default function PartnerListPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await fetch('/api/partners');
        if (!response.ok) {
          throw new Error('データの取得に失敗しました');
        }
        const data = await response.json();
        setPartners(data);
      } catch (error) {
        console.error('Error fetching partners:', error);
      }
    };

    fetchPartners();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          取引先管理
        </Typography>
        <Button variant="contained" color="primary" onClick={handleDialogOpen}>
          取引先登録
        </Button>
      </Box>
      <Paper sx={{ width: '100%', overflow: 'auto' }}>
        <TableContainer>
          <Table stickyHeader aria-label="partner list table">
            <TableHead>
              <TableRow>
                <TableCell>表示用名称</TableCell>
                <TableCell>正式名称</TableCell>
                <TableCell>OCR取引先名</TableCell>
                <TableCell>企業名カナ</TableCell>
                <TableCell>法人番号</TableCell>
                <TableCell>適格請求書発行事業者登録番号</TableCell>
                <TableCell>法人区分</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {partners.map((partner: Partner) => (
                <TableRow key={partner.id}>
                  <TableCell>{partner.displayName}</TableCell>
                  <TableCell>{partner.officialName}</TableCell>
                  <TableCell>{partner.ocrName}</TableCell>
                  <TableCell>{partner.companyNameKana}</TableCell>
                  <TableCell>{partner.corporateNumber}</TableCell>
                  <TableCell>{partner.invoiceRegistrationNumber}</TableCell>
                  <TableCell>{partner.corporateType}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <PartnerRegisterDialog open={dialogOpen} onClose={handleDialogClose} />
    </Box>
  );
} 