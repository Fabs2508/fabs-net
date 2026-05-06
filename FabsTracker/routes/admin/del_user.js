const express = require("express");
const router = express.Router();
const db = require("../db"); // DB-Verbindung
const { requireAdmin } = require("../middleware/requireAdmin");

router.delete('/:id', requireAdmin, (req, res) => {
  const userId = parseInt(req.params.id, 10);

  if (userId === req.session.userId) {
    return res.status(400).json({
      success: false,
      message: 'Du kannst dich nicht selbst löschen'
    });
  }
  if (userId === 108) {
    return res.status(400).json({
      success: false,
      message: 'Du kannst nicht den Owner löschen'
    });
  }

  db.query(
    'DELETE FROM users WHERE id = ?',
    [userId],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: 'Serverfehler'
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'User nicht gefunden'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'User gelöscht'
      });
    }
  );
});

module.exports = router;