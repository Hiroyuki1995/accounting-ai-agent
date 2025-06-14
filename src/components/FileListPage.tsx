'use client';

import { useEffect, useState } from 'react';
// import styles from './FileListPage.module.css'; // CSSモジュールを削除
import { Box, Button, CircularProgress, Dialog, DialogContent, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import Link from 'next/link'; // ファイル詳細画面へのリンクのため追加
import FileUpload from './FileUpload';

type FileItem = {
  id: number | null; // DBからのデータに合わせてidを追加
  name: string;
  status: string; // 新たに追加
  isLoadingStatus: boolean; // ローディング状態を追加
};

// APIから取得するファイル一覧の型定義
interface FileListItemAPI {
  id: number;
  file_name: string;
  uploaded_at: string;
  status: string;
  object_key: string;
  issuer_name: string | null;
  invoice_date: string | null;
  registration_number: string | null;
  tax_8_base: string | null; // BigIntが文字列で返されるため
  tax_8_amount: string | null;
  tax_8_total: string | null;
  tax_10_base: string | null;
  tax_10_amount: string | null;
  tax_10_total: string | null;
  total_amount: string | null;
}

export default function FileListPage() {
  const [showUpload, setShowUpload] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileItem[]>([]); // アップロード中のファイル
  const [processedFiles, setProcessedFiles] = useState<FileItem[]>([]); // DBから取得したファイル
  const [loading, setLoading] = useState(true); // ロード状態を追加
  const [isPollingActive, setIsPollingActive] = useState(true); // ポーリングを制御する状態

  // ファイル一覧をAPIから取得する関数
  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/files');
      if (response.ok) {
        const data: FileListItemAPI[] = await response.json();
        const newProcessedFiles: FileItem[] = data.map((f: FileListItemAPI) => ({
          id: f.id,
          name: f.file_name,
          status: f.status,
          isLoadingStatus: f.status === 'uploaded', // ステータスがuploadedならローディング中
        }));
        setProcessedFiles(newProcessedFiles);

        // uploadedFilesから、既にDBに登録されたファイルを削除
        setUploadedFiles(prevUploaded => {
          const apiFileNames = new Set(data.map((f: FileListItemAPI) => f.file_name));
          return prevUploaded.filter((uf: FileItem) => !apiFileNames.has(uf.name));
        });

        // 全てのuploadedファイルのポーリングを停止するかチェック
        const stillUploading = newProcessedFiles.some(f => f.status === 'uploaded');
        if (!stillUploading && uploadedFiles.length === 0) {
          setIsPollingActive(false); // 全て処理済みならポーリングを停止
        }

      } else {
        console.error('Failed to fetch files');
        // alert('ファイル一覧の取得に失敗しました。'); // MUIで表示するためアラートを削除
        setProcessedFiles([]);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      // alert('ファイル一覧の取得中にエラーが発生しました。'); // MUIで表示するためアラートを削除
      setProcessedFiles([]);
    } finally {
      setLoading(false);
    }
  };

  // コンポーネントマウント時にファイル一覧を取得し、ポーリングを開始
  useEffect(() => {
    fetchFiles();
    let intervalId: NodeJS.Timeout;

    if (isPollingActive) {
      intervalId = setInterval(() => {
        // uploadedFilesの中にuploadedステータスのものがあるか、またはprocessedFilesの中にuploadedステータスのものがあるかチェック
        const pollingNeeded = [...uploadedFiles, ...processedFiles].some(file => file.status === 'uploaded');
        if (pollingNeeded) {
          fetchFiles();
        } else {
          setIsPollingActive(false); // ポーリングが不要になったら停止
        }
      }, 5000); // 5秒ごとにポーリング
    }

    // 30秒経過しても未確認のままならポーリングを停止するタイマー
    const timeoutId = setTimeout(() => {
      // uploadedFiles に uploaded ステータスのファイルが残っている場合にポーリングを停止
      if (uploadedFiles.some(file => file.status === 'uploaded')) {
        setIsPollingActive(false);
      }
    }, 30000); // 30秒

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [isPollingActive, uploadedFiles, processedFiles]); // 依存配列にuploadedFilesとprocessedFilesを追加

  // アップロード成功時に一覧を更新
  const handleUploadSuccess = (uploadedNames: string[]) => {
    setShowUpload(false);
    // 新規ファイルをuploadedFilesの先頭に追加し、ローディング状態にする
    const newTempFiles: FileItem[] = uploadedNames.map((name: string) => ({
      id: null, // 仮のID
      name,
      status: 'uploaded',
      isLoadingStatus: true, // ローディング状態
    }));
    setUploadedFiles(prev => [...newTempFiles, ...prev]); // 先頭に追加
    setIsPollingActive(true); // 新規アップロードがあったらポーリングを再開
  };

  const allFiles = [...uploadedFiles, ...processedFiles];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          ファイル一覧
        </Typography>
        <Button variant="contained" color="primary" onClick={() => setShowUpload(true)}>
          アップロード
        </Button>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader aria-label="file list table">
            <TableHead>
              <TableRow>
                <TableCell>ファイル名</TableCell>
                <TableCell align="right">ステータス</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && allFiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    <CircularProgress size={24} sx={{ mr: 2 }} />
                    <Typography variant="body1">ファイル一覧を取得中...</Typography>
                  </TableCell>
                </TableRow>
              ) : allFiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    <Typography variant="body1" color="text.secondary">
                      アップロードされたファイルはありません
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                allFiles.map((file: FileItem) => (
                  <TableRow key={file.id || file.name}>
                    <TableCell component="th" scope="row">
                      {file.id ? (
                        <Link href={`/file/${file.id}`} passHref>
                          <Typography component="a" sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                            {file.name}
                          </Typography>
                        </Link>
                      ) : (
                        <Typography>{file.name}</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {file.isLoadingStatus ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <CircularProgress size={16} sx={{ mr: 1 }} />
                          <Typography variant="body2">処理中...</Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ bgcolor: file.status === '要確認' ? 'warning.light' : 'success.light', borderRadius: 1, px: 1, py: 0.5 }}>
                          {file.status}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
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