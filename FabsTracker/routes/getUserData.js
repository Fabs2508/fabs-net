const express = require("express");
const router = express.Router();
const db = require("./db"); // DB-Verbindung

router.get('/', (req, res) => {
  db.query(
    'SELECT userData, role FROM users WHERE id = ?',
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
        return res.status(404).json({
          success: false,
          message: 'User nicht gefunden',
          status: 404
        });
      }

      const user = results[0];

      // WICHTIG: userData von JSON-String zu Objekt umwandeln
      let parsedUserData;
      try {
        parsedUserData = typeof user.userData === 'string' 
          ? JSON.parse(user.userData) 
          : user.userData;
      } catch (e) {
        parsedUserData = user.userData; // Fallback
      }

      return res.status(200).json({
        success: true,
        userData: parsedUserData, // Jetzt als echtes Objekt
        role: user.role           // 'admin'
      });
    }
  );
});


module.exports = router;