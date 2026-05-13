const express = require("express");
const router = express.Router();
const db = require("./db"); // DB-Verbindung
const { requireLogin } = require("./middleware/requireLogin");

router.get('/', requireLogin, (req, res) => {
  db.query(
    'SELECT last_login, last_seen FROM users WHERE id = ?',
    [req.session.userId],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Serverfehler',
          status: 500
        });
      }

      if (results.length === 0) {
        return res.json({
          success: false,
          message: 'User nicht gefunden',
          status: 404
        });
      }

      const user = results[0];

      return res.status(200).json({
        success: true,
        userstatus: user
      });
    }
  );
});


module.exports = router;