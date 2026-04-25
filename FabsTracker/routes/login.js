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

// Middleware: Prüft ob User eingeloggt ist
const redirectIfLoggedIn = (req, res, next) => {
    if (req.session.userId) {
        return res.redirect('/home'); // Schickt eingeloggte User sofort weg vom Login
    }
    next();
};

router.post("/", loginLimiter, redirectIfLoggedIn, (req, res) => {
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
            message: "E-Mail oder Passwort falsch!",
          });
        }

        db.query(
          "UPDATE users SET last_login = NOW() WHERE id = ?",
          [user.id],
          (updateErr) => {
            if (updateErr) {
              console.error("Fehler beim Update von last_login:", updateErr);
              // Wir machen trotzdem weiter, damit der User sich einloggen kann
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
          }
        );
        
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