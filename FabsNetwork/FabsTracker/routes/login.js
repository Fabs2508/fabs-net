const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("./db");


router.post("/", (req, res) => {
  const { email, password } = req.body;

  //console.log(email, password);

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: "Serverfehler",
        });
      }

      if (results.length === 0) {
        return res.status(401).json({
          success: false,
          message: "Email oder Passwort falsch!",
        });
      }

      const user = results[0];

      try {
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
          return res.status(401).json({
            success: false,
            message: "E-Mail oder Passwort falsch",
          });
        }

        // Session setzen
        req.session.userId = user.id;
        req.session.role = user.role;
        req.session.email = user.email;

        req.session.save((err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              success: false,
              message: "Session konnte nicht gespeichert werden",
            });
          }

          return res.status(200).json({
            success: true,
            message: "Login erfolgreich",
          });
        });
      } catch (error) {
        console.error(error);
        return res.status(500).json({
          success: false,
          message: "Fehler beim Passwortvergleich",
        });
      }
    }
  );
});

module.exports = router;