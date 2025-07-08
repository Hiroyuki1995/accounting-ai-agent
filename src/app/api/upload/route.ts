import { addFileProcessingJob } from '@/lib/queue';
// import { writeFile } from 'fs/promises'; // ローカルファイル保存は不要になるため削除
import { NextRequest, NextResponse } from 'next/server';
// import { join } from 'path'; // ローカルファイル保存は不要になるため削除
import { uploadFilesToMinioAndDb } from '@/lib/uploadFiles';
import { AuthUser, withAuth } from '@/middleware/withAuth';

export const POST = withAuth(async (request: NextRequest, user: AuthUser) => {
  try {
    
    // await ensureBucketExists(MINIO_BUCKET_NAME);
    const org_id = user.org_id;
    if (!org_id) {
      return NextResponse.json({ error: 'ユーザー情報の取得に失敗しました' }, { status: 500 });
    }
    

    const formData = await request.formData();
    const files = formData.getAll('file') as File[];
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'ファイルが見つかりません。' },
        { status: 400 }
      );
    }
    const createdFiles = await uploadFilesToMinioAndDb(files,org_id);

    for (const file of createdFiles) {
      await addFileProcessingJob(file.id);
    }

    const responseFiles = createdFiles.map((file, index) => ({
      name: file.file_name,
      id: file.id,
    }));

    // 成功時のレスポンスを修正 (ファイル名とIDのリストを返す)
    return NextResponse.json(
      { 
        message: 'ファイルのアップロードが完了しました。',
        files: responseFiles, // ファイル名とIDを含むオブジェクトのリストを返す
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    // unknown型のエラーからメッセージを取得するには型ガードが必要
    if (error instanceof Error) {
      console.error('Error uploading file to MinIO or DB:', error);
    } else {
      console.error('An unknown error occurred during file upload', error);
    }
    return NextResponse.json(
      { error: 'ファイルのアップロード中にエラーが発生しました。' },
      { status: 500 }
    );
  }
});