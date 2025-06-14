import { Queue } from 'bullmq';
import Redis from 'ioredis';

// Redis接続設定
const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
});

// "fileProcessingQueue" という名前のキューを作成
export const fileProcessingQueue = new Queue('fileProcessingQueue', { connection });

// キューにジョブを追加するヘルパー関数
export const addFileProcessingJob = async (fileId: number) => {
  console.debug('キューにジョブを追加')
  await fileProcessingQueue.add('processFileStatus', { fileId }, {
    delay: Math.floor(Math.random() * (20000 - 10000 + 1)) + 10000, // 10秒から20秒のランダムな遅延
  });
}; 