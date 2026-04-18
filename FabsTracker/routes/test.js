const express = require("express");
const router = express.Router();

// Einfacher Test-Endpunkt
router.get('/', (req, res) => {
  res.send('Test Route OK');
});

module.exports = router;