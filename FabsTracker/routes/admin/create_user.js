const express = require("express");
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require("../db"); // DB-Verbindung
const { requireAdmin } = require("../middleware/requireAdmin");

router.post('/', requireAdmin, async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    db.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role],
      (err, result) => {
        if (err) {
          console.error(err);

          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
              success: false,
              message: 'E-Mail existiert bereits'
            });
          }

          return res.status(500).json({
            success: false,
            message: 'Serverfehler'
          });
        }

        return res.status(201).json({
          success: true,
          message: 'User erstellt',
          userId: result.insertId
        });
      }
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'Fehler beim Erstellen des Users'
    });
  }
});

module.exports = router;