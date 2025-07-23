router.get('/health', (req, res) => {
  res.json({
    db: databaseStatus(),
    redis: redisStatus(),
    memory: process.memoryUsage()
  });
});