const express = require("express");
const router = express.Router();

const db = require("./db");
const { requireLogin } = require("./middleware/requireLogin");

router.post("/", requireLogin, (req, res) => {

    const date = Date.now();

  db.query(
    "UPDATE users SET last_seen = ? WHERE id = ?",
    [date, req.session.userId],
    (err) => {

      if (err) {
        console.error(err);

        return res.status(500).json({
          success: false
        });
      }

      return res.json({
        date: date,
        success: true
      });
    }
  );

});

module.exports = router;