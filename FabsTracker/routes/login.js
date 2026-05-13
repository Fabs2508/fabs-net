const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("./db");
const rateLimit = require("express-rate-limit");


const loginLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // Zeitfenster: 2 Minuten
  max: 5, // Maximal 5 Login-Versuche pro IP-Adresse...
  handler: (req, res, next, options) => {
    // Berechne die verbleibende Zeit in Minuten
    const resetTime = req.rateLimit.resetTime; // Das ist ein Date-Objekt
    const remainingMs = resetTime - Date.now();
    const remainingMinutes = Math.ceil(remainingMs / (1000 * 60));

    res.status(429).json({
      success: false,
      message: `Zu viele Versuche. Bitte versuche es in ${remainingMinutes} Minute(n) erneut.`,
      retryAfter: remainingMinutes // Optional als Zahl für das Frontend
    });
  },
  standardHeaders: true, // Schickt Info über das Limit in den Headern (RateLimit-Limit)
  legacyHeaders: false, // Deaktiviert alte X-RateLimit-Header
});

router.post("/", loginLimiter, (req, res) => {
  const { email, password } = req.body;

  const doLogin = async () => {
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) {
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
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
          return res.status(401).json({
            success: false,
            message: "E-Mail oder Passwort falsch!",
          });
        }

        const date = Date.now();

        // last_login updaten (OHNE Response!)
        db.query(
          "UPDATE users SET last_login = ? WHERE id = ?",
          [date, user.id],
          (updateErr) => {
            if (updateErr) {
              console.error("Fehler beim Update:", updateErr);
            }
          }
        );

        // Session neu erstellen (einziger Response!)
        req.session.regenerate((err) => {
          //console.log("SESSION REGENERATE");
          if (err) {
            return res.status(500).json({
              success: false,
              message: "Session Fehler"
            });
          }

          req.session.userId = user.id;
          req.session.role = user.role;

          req.session.save((err) => {
            //console.log("SESSION SAVED");
            if (err) {
              return res.status(500).json({
                success: false,
                message: "Session konnte nicht gespeichert werden"
              });
            }
            return res.json({
                success: true,
                message: "Login erfolgreich"
              });
          });
        });
      }
    );
  };
  doLogin();
});

module.exports = router;