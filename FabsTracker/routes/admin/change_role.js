const express = require("express");
const router = express.Router();

const db = require("../db");

const { requireLogin } = require("../middleware/requireLogin");
const { requireAdmin } = require("../middleware/requireAdmin");

// Registrierung
router.post('/', requireLogin, requireAdmin, async (req, res) => {
  const { userId, role } = req.body;

  if (userId === req.session.userId) {
    return res.json({
      success: false,
      message: 'Du kannst dir keinen Admin Rang entfernen',
      status: 400
    });
  }

  if (!userId || !role) {
    return res.json({
      success: false,
      message: "Fehlende Daten"
    });
  }

  if (!["user", "admin"].includes(role)) {
    return res.json({
      success: false,
      message: "Ungültige Rolle"
    });
  }

  db.query(
    "UPDATE users SET role = ? WHERE id = ?",
    [role, userId],
    (err) => {
      if (err) {
        console.error(err);

        return res.status(500).json({
          success: false
        });
      }

      return res.json({
        success: true
      });
    }
  );
});

module.exports = router;
