const express = require("express");
const router = express.Router();
const db = require("./db");

router.post("/", (req, res) => {

  const theme = req.body?.Theme;

  if (!theme) {
    return res.json({
      success: false,
      message: "Kein Theme gesendet"
    });
  }

  //in DB speichern
  db.query(
    "SELECT userData FROM users WHERE id = ?",
    [req.session.userId],
    (err, results) => {
      if (err) {
        return res.json({
          success: false,
          status: 500
        });
      }

      let userData = {};

      try {
        userData = typeof results[0].userData === "string"
          ? JSON.parse(results[0].userData)
          : results[0].userData;
      } catch {
        userData = {};
      }

      // 2. Theme setzen
      userData.theme = theme;

      // 3. zurück in DB speichern
      db.query(
        "UPDATE users SET userData = ? WHERE id = ?",
        [JSON.stringify(userData), req.session.userId],
        (updateErr) => {
          if (updateErr) {
            return res.status(500).json({ success: false });
          }

          return res.json({
            success: true,
            theme
          });
        }
      );
    }
  );
  
});

module.exports = router;