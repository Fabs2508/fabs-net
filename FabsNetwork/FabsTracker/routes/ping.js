const express = require("express");
const router = express.Router();

router.get('/', (req, res) => {
  const start = Date.now();
  const clientIP = req.headers['cf-connecting-ip'] || req.ip;

  const duration = Date.now() - start;
  //console.log(`Ping von IP: ${clientIP} | Dauer: ${duration}ms`);

  res.send(`pong | IP: ${clientIP} | Dauer: ${duration}ms`);
});

module.exports = router;