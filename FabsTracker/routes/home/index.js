const express = require("express");
const router = express.Router();

// Alle Home-Routen importieren
router.use("/home", require("./home"));
router.use("/settings", require("./settings"));


module.exports = router;