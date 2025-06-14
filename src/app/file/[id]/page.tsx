'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
// import styles from './page.module.css'; // CSSモジュールを削除
import { Alert, Box, Button, CircularProgress, Paper, TextField, Typography } from '@mui/material';

interface FileDetailPageProps {
  params: { id: string };
}

// ファイル詳細データの型定義 (APIレスポンスに合わせる)
interface FileDetailData {
  id: number;
  file_name: string;
  uploaded_at: string; // ISO 8601 形式の文字列を想定
  status: string;
  object_key: string; // MinIOのファイルパスを保存 (file_pathから変更)
  // Gemini APIから抽出される項目
  issuer_name?: string | null;
  invoice_date?: string | null; // ISO 8601 形式の文字列を想定
  registration_number?: string | null;
  tax_8_base?: number | string | null;
  tax_8_amount?: number | string | null;
  tax_8_total?: number | string | null;
  tax_10_base?: number | string | null;
  tax_10_amount?: number | string | null;
  tax_10_total?: number | string | null;
  total_amount?: number | string | null;
}

export default function FileDetailPage({ params }: FileDetailPageProps) {
  const fileId = params.id; // URLからファイルIDを取得
  const [fileData, setFileData] = useState<FileDetailData | null>(null); // ファイルデータを保持
  const [editableFileData, setEditableFileData] = useState<FileDetailData | null>(null); // 編集可能なファイルデータを保持
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false); // 更新中の状態

  // リサイズ機能のためのStateとRef
  const [pdfWidth, setPdfWidth] = useState(() => {
    // localStorageから保存された幅を読み込む (初回ロード時のみ)
    if (typeof window !== 'undefined') {
      const savedWidth = localStorage.getItem('pdfSplitterWidth');
      if (savedWidth) {
        return parseFloat(savedWidth);
      }
    }
    return 50; // デフォルトの初期幅（パーセンテージ）
  });
  const [isResizing, setIsResizing] = useState(false);
  const contentAreaRef = useRef<HTMLDivElement>(null);
  const pdfPreviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchFileData = async () => {
      try {
        const response = await fetch(`/api/files/${fileId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Error fetching file data: ${response.statusText} - ${errorData.error}`);
        }
        const data: FileDetailData = await response.json();
        setFileData(data);
        setEditableFileData(data); // 編集用データも初期化
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('不明なエラーが発生しました。');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFileData();
  }, [fileId]);

  // 入力フィールドの変更ハンドラ
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setEditableFileData(prev => {
      if (!prev) return null;
      return { ...prev, [id]: value };
    });
  };

  // 更新ボタンのハンドラ
  const handleUpdate = async () => {
    if (!editableFileData) return;

    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editableFileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error updating file: ${response.statusText} - ${errorData.error}`);
      }

      const updatedData: FileDetailData = await response.json();
      setFileData(updatedData); // 元のファイルデータも更新
      setEditableFileData(updatedData); // 編集用データも最新に
      alert('ファイル情報が更新され、「確認済み」になりました。');

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('ファイル情報の更新中に不明なエラーが発生しました。');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // リサイズイベントハンドラ
  const handleMouseDown = useCallback(() => {
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !contentAreaRef.current || !pdfPreviewRef.current) return;

    const contentAreaRect = contentAreaRef.current.getBoundingClientRect();
    const newPdfWidthPx = e.clientX - contentAreaRect.left;
    const newPdfWidthPercent = (newPdfWidthPx / contentAreaRect.width) * 100;

    // 最小幅・最大幅の制限
    const minWidthPercent = 20; // 最小20%
    const maxWidthPercent = 80; // 最大80%

    setPdfWidth(Math.max(minWidthPercent, Math.min(maxWidthPercent, newPdfWidthPercent)));
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    // リサイズが終了したら現在の幅をlocalStorageに保存
    if (typeof window !== 'undefined') {
      localStorage.setItem('pdfSplitterWidth', pdfWidth.toString());
    }
  }, [pdfWidth]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>ファイル情報を読み込み中...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <Typography>エラー: {error}</Typography>
        </Alert>
      </Box>
    );
  }

  if (!fileData || !editableFileData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          <Typography>ファイル情報が見つかりませんでした。</Typography>
        </Alert>
      </Box>
    );
  }

  // MinIOのファイルURLを生成
  const minioFileUrl = fileData.object_key
    ? `${process.env.NEXT_PUBLIC_MINIO_ENDPOINT}/${process.env.NEXT_PUBLIC_MINIO_BUCKET_NAME}/${fileData.object_key}`
    : null;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        ファイル詳細: {fileData.file_name}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          height: 'calc(100vh - 100px)', // ヘッダーなどを考慮した高さ
          flexDirection: { xs: 'column', md: 'row' }, // レスポンシブ対応
        }}
        ref={contentAreaRef}
      >
        <Paper
          sx={{
            flex: `0 0 ${pdfWidth}%`,
            border: '1px solid', borderColor: 'grey.300',
            borderRadius: 2,
            p: 2,
            backgroundColor: 'background.paper',
            overflow: 'auto',
            boxSizing: 'border-sizing',
            minWidth: { xs: '100%', md: '20%' }, // レスポンシブ最小幅
            maxWidth: { xs: '100%', md: '80%' }, // レスポンシブ最大幅
          }}
          ref={pdfPreviewRef}
        >
          <Typography variant="h6" component="h2" gutterBottom>PDFプレビュー</Typography>
          {minioFileUrl ? (
            <Box sx={{ height: 'calc(100% - 40px)' }}>
              <iframe src={minioFileUrl} width="100%" height="100%" style={{ border: 'none' }}></iframe>
            </Box>
          ) : (
            <Typography color="text.secondary">PDFファイルのオブジェクトキーが見つかりません。</Typography>
          )}
        </Paper>
        <Box
          sx={{
            width: { xs: '100%', md: '2px' }, // デスクトップでは幅を2pxに
            height: { xs: '2px', md: 'auto' }, // モバイルでは高さを2pxに
            cursor: { xs: 'row-resize', md: 'col-resize' },
            backgroundColor: 'divider',
            flexShrink: 0,
            my: { xs: 2, md: 0 },
            mx: { xs: 0, md: 1 }, // デスクトップでは左右マージンを少し減らす
          }}
          onMouseDown={handleMouseDown}
        ></Box>
        <Paper
          sx={{
            flex: `0 0 ${100 - pdfWidth}%`,
            border: '1px solid', borderColor: 'grey.300',
            borderRadius: 2,
            p: 2,
            backgroundColor: 'background.paper',
            overflow: 'auto',
            boxSizing: 'border-box',
            minWidth: { xs: '100%', md: '20%' }, // レスポンシブ最小幅
            maxWidth: { xs: '100%', md: '80%' }, // レスポンシブ最大幅
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>入力フォーム</Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
            <TextField
              fullWidth
              id="issuer_name"
              label="発行元企業名"
              variant="outlined"
              size="small"
              value={editableFileData.issuer_name || ''}
              onChange={handleChange}
              sx={{ flex: 1, minWidth: { xs: '100%', md: '200px' } }}
            />
            <TextField
              fullWidth
              id="registration_number"
              label="適格請求書登録番号"
              variant="outlined"
              size="small"
              value={editableFileData.registration_number || ''}
              onChange={handleChange}
              sx={{ flex: 1, minWidth: { xs: '100%', md: '200px' } }}
            />
          </Box>

          <TextField
            fullWidth
            margin="normal"
            id="invoice_date"
            label="請求日"
            variant="outlined"
            size="small"
            value={editableFileData.invoice_date ? editableFileData.invoice_date.split('T')[0] : ''} // YYYY-MM-DD 形式に整形
            onChange={handleChange}
            sx={{ mb: 2 }}
          />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>8% 税率</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <TextField
                label="税抜金額"
                id="tax_8_base"
                variant="outlined"
                size="small"
                type="number"
                value={editableFileData.tax_8_base !== null ? editableFileData.tax_8_base?.toString() : ''}
                onChange={handleChange}
                sx={{ flex: '1 1 30%', minWidth: '90px' }}
              />
              <TextField
                label="税額"
                id="tax_8_amount"
                variant="outlined"
                size="small"
                type="number"
                value={editableFileData.tax_8_amount !== null ? editableFileData.tax_8_amount?.toString() : ''}
                onChange={handleChange}
                sx={{ flex: '1 1 30%', minWidth: '90px' }}
              />
              <TextField
                label="税込金額"
                id="tax_8_total"
                variant="outlined"
                size="small"
                type="number"
                value={editableFileData.tax_8_total !== null ? editableFileData.tax_8_total?.toString() : ''}
                onChange={handleChange}
                sx={{ flex: '1 1 30%', minWidth: '90px' }}
              />
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>10% 税率</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <TextField
                label="税抜金額"
                id="tax_10_base"
                variant="outlined"
                size="small"
                type="number"
                value={editableFileData.tax_10_base !== null ? editableFileData.tax_10_base?.toString() : ''}
                onChange={handleChange}
                sx={{ flex: '1 1 30%', minWidth: '90px' }}
              />
              <TextField
                label="税額"
                id="tax_10_amount"
                variant="outlined"
                size="small"
                type="number"
                value={editableFileData.tax_10_amount !== null ? editableFileData.tax_10_amount?.toString() : ''}
                onChange={handleChange}
                sx={{ flex: '1 1 30%', minWidth: '90px' }}
              />
              <TextField
                label="税込金額"
                id="tax_10_total"
                variant="outlined"
                size="small"
                type="number"
                value={editableFileData.tax_10_total !== null ? editableFileData.tax_10_total?.toString() : ''}
                onChange={handleChange}
                sx={{ flex: '1 1 30%', minWidth: '90px' }}
              />
            </Box>
          </Box>

          <TextField
            fullWidth
            margin="normal"
            id="total_amount"
            label="合計税込金額"
            variant="outlined"
            size="small"
            type="number"
            value={editableFileData.total_amount !== null ? editableFileData.total_amount?.toString() : ''}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleUpdate}
            disabled={isUpdating}
            sx={{ mt: 2 }}
          >
            {isUpdating ? <CircularProgress size={24} color="inherit" /> : '更新'}
          </Button>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </Paper>
      </Box>
    </Box>
  );
} 