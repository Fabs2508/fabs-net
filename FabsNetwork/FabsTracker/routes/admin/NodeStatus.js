const express = require("express");
const router = express.Router();
const os = require('os');
const { requireAdmin } = require("../middleware/requireAdmin");

router.get("/", requireAdmin, (req, res) => {
  res.json({
    uptime: process.uptime(),
    memory: {
      total: os.totalmem(),
      free: os.freemem(),
    },
    cpuLoad: os.loadavg(),
    platform: os.platform(),
    nodeVersion: process.version,
    time: new Date()
  });
});

module.exports = router;