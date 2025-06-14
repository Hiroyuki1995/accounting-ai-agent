'use client';

import Image from 'next/image';
import { useCallback, useState } from 'react';
// import styles from './FileUpload.module.css'; // CSSモジュールを削除

import { Alert, Box, Button, List, ListItem, ListItemText, Typography } from '@mui/material';

interface FileUploadProps {
  onUploadSuccess?: (uploaded: string[]) => void;
}

export default function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null); // アップロードエラーメッセージ

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setUploadError(null); // エラーをリセット
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const allowedFiles = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf');
      if (allowedFiles.length !== e.dataTransfer.files.length) {
        setUploadError('PDFファイルのみアップロードできます。');
      }
      setFiles(allowedFiles);
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setUploadError(null); // エラーをリセット
    if (e.target.files && e.target.files.length > 0) {
      const allowedFiles = Array.from(e.target.files).filter(file => file.type === 'application/pdf');
      if (allowedFiles.length !== e.target.files.length) {
        setUploadError('PDFファイルのみアップロードできます。');
      }
      setFiles(allowedFiles);
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files.length) return;
    setUploading(true);
    setUploadError(null); // エラーをリセット

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('file', file);
    });
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        // alert('ファイルのアップロードが完了しました！'); // MUIで表示するためアラートを削除
        if (onUploadSuccess) {
          onUploadSuccess(files.map(f => f.name));
        }
        setFiles([]);
      } else {
        const errorText = await response.text();
        setUploadError(`アップロードに失敗しました: ${errorText}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadError('アップロード中にエラーが発生しました。');
    }
    setUploading(false);
  }, [files, onUploadSuccess]);

  return (
    <Box
      sx={{
        padding: 3,
        borderRadius: 2,
        backgroundColor: 'background.paper',
        boxShadow: 3,
        maxWidth: 600,
        margin: 'auto',
      }}
    >
      <Typography variant="h5" component="h2" gutterBottom align="center">
        書類アップロード
      </Typography>
      <Box
        component="form"
        sx={{
          border: dragActive ? '2px dashed primary.main' : '2px dashed #ccc',
          borderRadius: 2,
          padding: 4,
          textAlign: 'center',
          minHeight: 200,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          cursor: 'pointer',
          transition: 'border-color 0.3s',
          '&:hover': {
            borderColor: 'primary.main',
          },
        }}
        onDragEnter={handleDrag}
        onSubmit={handleSubmit}
      >
        <input
          type="file"
          id="file-upload"
          style={{ display: 'none' }} // ファイル入力要素を非表示
          onChange={handleChange}
          accept="application/pdf"
          multiple
        />
        <label htmlFor="file-upload" style={{ width: '100%', height: '100%', display: 'block', cursor: 'pointer' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Image src="/upload-icon.svg" alt="アップロードアイコン" width={120} height={80} />
            {files.length > 0 ? (
              <List sx={{ mt: 2 }}>
                {files.map((file) => (
                  <ListItem key={file.name} disablePadding>
                    <ListItemText primary={file.name} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                ドラッグアンドドロップするかファイルを選択してください
                <br />
                <Typography variant="caption" display="block" color="error.main" sx={{ mt: 1 }}>
                  ※PDFファイルのみアップロードできます
                </Typography>
              </Typography>
            )}
          </Box>
        </label>

        {dragActive && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 137, 62, 0.1)', // primary.main の半透明
              zIndex: 1,
              borderRadius: 2,
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          />
        )}
      </Box>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => document.getElementById('file-upload')?.click()}
          sx={{ flexShrink: 0 }}
        >
          ＋ファイルを選択
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={!files.length || uploading}
          sx={{ flexGrow: 1 }}
        >
          {uploading ? 'アップロード中...' : 'アップロード'}
        </Button>
      </Box>

      {uploadError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {uploadError}
        </Alert>
      )}
    </Box>
  );
} 