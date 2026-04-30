const express = require("express");
const router = express.Router();

// Alle Admin-Routen importieren
router.use("/NodeStatus", require("./NodeStatus"))
router.use("/PiStatus", require("./PiStatus"))

router.use("/del_user", require("./del_user"));
router.use("/create_user", require("./create_user"));
router.use("/change_role", require("./change_role"))

module.exports = router;