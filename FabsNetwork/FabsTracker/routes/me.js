const express = require("express");
const router = express.Router();
const db = require("./db"); // DB-Verbindung
const { requireLogin } = require("./middleware/requireLogin");

router.get('/', requireLogin, (req, res) => {
  db.query(
    'SELECT id, username, email, role FROM users WHERE id = ?',
    [req.session.userId],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Serverfehler'
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User nicht gefunden'
        });
      }

      return res.status(200).json({
        success: true,
        user: results[0]
      });
    }
  );
});

module.exports = router;