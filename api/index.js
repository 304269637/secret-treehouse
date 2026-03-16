// Vercel Serverless函数 - 主入口
import serverlessBackend from '../serverless-backend.js';

export default async function (req, res) {
  return serverlessBackend(req, res);
}