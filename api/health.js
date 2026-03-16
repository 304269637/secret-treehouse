// Vercel Serverless Function - 健康检查
module.exports = (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    message: "匿名情绪树洞服务器运行正常",
    timestamp: new Date().toISOString(),
    version: "2.0.0",
    environment: process.env.NODE_ENV || "development"
  });
};