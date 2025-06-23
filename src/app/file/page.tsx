'use client';

import { Box, Button, CircularProgress, Dialog, DialogContent, Paper, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import FileUpload from '../../../src/components/FileUpload';

type FileItem = {
  id: number | string;
  name: string;
  status: string;
  uploaded_at: string;
  isLoadingStatus: boolean;
  issuer_name?: string | null;
  invoice_date?: string | null;
  total_amount?: string | null;
};

type FileApiResponse = {
  id: number;
  file_name: string;
  uploaded_at: string;
  status: string;
  issuer_name: string | null;
  invoice_date: string | null;
  total_amount: string | null;
}[];

export default function FileListPage() {
  const [showUpload, setShowUpload] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileItem[]>([]);
  const [processedFiles, setProcessedFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPollingActive, setIsPollingActive] = useState(true);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/files');
      if (response.ok) {
        const data: FileApiResponse = await response.json();
        console.log('API Response data:', data);
        let currentPollingNeeded = false;

        const newProcessedFiles: FileItem[] = data.map(f => {
          if (f.status === 'uploaded' && (Date.now() - new Date(f.uploaded_at).getTime()) <= 30000) {
            currentPollingNeeded = true;
          }
          return {
            id: f.id,
            name: f.file_name,
            status: f.status,
            uploaded_at: f.uploaded_at,
            isLoadingStatus: f.status === 'uploaded',
            issuer_name: f.issuer_name,
            invoice_date: f.invoice_date,
            total_amount: f.total_amount?.toString(),
          };
        });
        console.log('New Processed Files:', newProcessedFiles);
        setProcessedFiles(newProcessedFiles);

        setUploadedFiles(prevUploaded => {
          const apiFileNames = new Set(data.map(f => f.file_name));
          const updatedPrevUploaded = prevUploaded.map(uf => {
            if (apiFileNames.has(uf.name)) {
              return null;
            }

            const thirtySecondsPassed = (Date.now() - new Date(uf.uploaded_at).getTime()) > 30000;
            if (thirtySecondsPassed && uf.isLoadingStatus) {
              return { ...uf, isLoadingStatus: false };
            }
            if (uf.status === 'uploaded' && !thirtySecondsPassed) {
              currentPollingNeeded = true;
            }
            return uf;
          }).filter(file => file !== null) as FileItem[];

          return updatedPrevUploaded;
        });

        setIsPollingActive(currentPollingNeeded);

      } else {
        console.error('Failed to fetch files');
        setProcessedFiles([]);
        setIsPollingActive(false);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      setProcessedFiles([]);
      setIsPollingActive(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    if (isPollingActive) {
      intervalIdRef.current = setInterval(fetchFiles, 5000);
    }

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [isPollingActive, fetchFiles]);

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUploadSuccess = (uploadedNames: string[]) => {
    setShowUpload(false);
    const newTempFiles: FileItem[] = uploadedNames.map((name) => ({
      id: crypto.randomUUID(),
      name,
      status: 'uploaded',
      uploaded_at: new Date().toISOString(),
      isLoadingStatus: true,
      issuer_name: null,
      invoice_date: null,
      total_amount: null,
    }));
    setUploadedFiles(prev => [...newTempFiles, ...prev]);
    setIsPollingActive(true);
  };

  const allFiles = [...uploadedFiles, ...processedFiles];
  console.log('All files for DataGrid:', allFiles);

  const columns: GridColDef<FileItem>[] = [
    {
      field: 'name',
      headerName: '書類名',
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams<FileItem>) => {
        const fileId = params.row.id;
        return fileId && typeof fileId === 'number' ? (
          <Link href={`/file/${fileId}`} passHref>
            <Typography
              sx={{
                color: 'primary.main',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
                whiteSpace: 'normal',
                overflowWrap: 'break-word',
                wordBreak: 'break-all',
              }}
            >
              {params.value}
            </Typography>
          </Link>
        ) : (
          <Typography sx={{
            whiteSpace: 'normal',
            overflowWrap: 'break-word',
            wordBreak: 'break-all',
          }}>{params.value}</Typography>
        );
      },
    },
    {
      field: 'uploaded_at',
      headerName: 'アップロード日',
      width: 180,
      minWidth: 180,
      valueFormatter: (params: GridRenderCellParams<FileItem>) => {
        if (!params || params.value === null || params.value === undefined) {
          return '-';
        }
        const value = params.value;
        return typeof value === 'string' && value !== '' ? format(parseISO(value), 'yyyy/MM/dd HH:mm') : '-';
      },
      renderCell: (params: GridRenderCellParams<FileItem, string>) => (
        <Typography>{params.value || '-'}</Typography>
      ),
    },
    {
      field: 'issuer_name',
      headerName: '発行元企業名',
      flex: 1,
      minWidth: 150,
      valueFormatter: (params: GridRenderCellParams<FileItem>) => {
        if (!params || params.value === null || params.value === undefined) {
          return '-';
        }
        const value = params.value;
        return typeof value === 'string' && value !== '' ? value : '-';
      },
      renderCell: (params: GridRenderCellParams<FileItem, string | null | undefined>) => (
        <Typography>{params.value || '-'}</Typography>
      ),
    },
    {
      field: 'invoice_date',
      headerName: '請求日',
      width: 150,
      minWidth: 150,
      valueFormatter: (params: GridRenderCellParams<FileItem>) => {
        if (!params || params.value === null || params.value === undefined) {
          return '-';
        }
        const value = params.value;
        return typeof value === 'string' && value !== '' ? format(parseISO(value), 'yyyy/MM/dd') : '-';
      },
      renderCell: (params: GridRenderCellParams<FileItem, string | null | undefined>) => (
        <Typography>{params.value || '-'}</Typography>
      ),
    },
    {
      field: 'total_amount',
      headerName: '合計税込金額',
      width: 150,
      minWidth: 150,
      valueFormatter: (params: GridRenderCellParams<FileItem>) => {
        if (!params || params.value === null || params.value === undefined) {
          return '-';
        }
        const value = params.value;
        return typeof value === 'string' && value !== '' ? `¥${Number(value).toLocaleString()}` : '-';
      },
      renderCell: (params: GridRenderCellParams<FileItem, string | null | undefined>) => (
        <Typography>{params.value || '-'}</Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'ステータス',
      width: 120,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams<FileItem, string>) => (
        params.row.isLoadingStatus ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CircularProgress size={16} sx={{ mr: 1 }} />
            <Typography variant="body2">処理中...</Typography>
          </Box>
        ) : (
          <Typography
            variant="body2"
            sx={{
              bgcolor: params.value === '要確認' ? 'warning.light' : 'success.light',
              borderRadius: 1,
              px: 1,
              py: 0.5,
              display: 'inline-block',
            }}
          >
            {params.value}
          </Typography>
        )
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          書類一覧
        </Typography>
        <Button variant="contained" color="primary" onClick={() => setShowUpload(true)}>
          アップロード
        </Button>
      </Box>

      <Paper sx={{ width: '100%', height: 'calc(100vh - 200px)' }}>
        <DataGrid
          rows={allFiles}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
          onRowClick={(params) => {
            if (params.row.id && typeof params.row.id === 'number') {
              router.push(`/file/${params.row.id}`);
            }
          }}
          sx={{
            '& .MuiDataGrid-columnHeaders': {
              borderBottom: '1px solid',
              borderColor: 'divider',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              whiteSpace: 'normal',
              overflowWrap: 'break-word',
              wordBreak: 'break-all',
              overflow: 'hidden',
            },
            '& .MuiDataGrid-cell': {
              whiteSpace: 'normal',
              overflowWrap: 'break-word',
              wordBreak: 'break-all',
              overflow: 'hidden',
            },
          }}
        />
      </Paper>

      <Dialog open={showUpload} onClose={() => setShowUpload(false)} maxWidth="md" fullWidth>
        <DialogContent sx={{ p: 4 }}>
          <FileUpload onUploadSuccess={handleUploadSuccess} />
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => setShowUpload(false)}
            sx={{ mt: 3, width: '100%' }}
          >
            閉じる
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
} 