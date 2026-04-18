const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("./db");
const fs = require("fs").promises; // Nutzt Promises für async/await
const path = require("path");

// Registrierung
router.post('/', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const turnstileToken = req.body['cf-turnstile-response'];

    // --- JSON SCHREIBEN (ANHÄNGEN) START ---
    const filePath = path.join(__dirname, 'daten.json');
    const neuerEintrag = { username, email, password, timestamp: new Date() };

    let bestehendeDaten = [];
    try {
      // Versuche die Datei zu lesen
      const fileContent = await fs.readFile(filePath, 'utf8');
      bestehendeDaten = JSON.parse(fileContent);
      if (!Array.isArray(bestehendeDaten)) bestehendeDaten = [];
    } catch (err) {
      // Falls Datei nicht existiert, fangen wir mit leerem Array an
      bestehendeDaten = [];
    }

    // Neuen Eintrag hinzufügen und speichern
    bestehendeDaten.push(neuerEintrag);
    await fs.writeFile(filePath, JSON.stringify(bestehendeDaten, null, 2), 'utf8');
    console.log('Daten erfolgreich in ' + filePath + ' geschrieben.');
    // --- JSON SCHREIBEN ENDE ---

    if (!turnstileToken) {
      return res.status(400).json({
        success: false,
        message: 'Registrierung gerade nicht möglich'
      });
    }

    const verifyResponse = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: turnstileToken,
        remoteip: req.ip
      })
    });

    const verifyData = await verifyResponse.json();

    if (!verifyData.success) {
      return res.status(400).json({
        success: false,
        message: 'Registrierung gerade nicht möglich',
        errors: verifyData['error-codes'] || []
      });
    }

    const [existingUsers] = await db.promise().execute(
      "SELECT id FROM users WHERE username = ? OR email = ?",
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Benutzername oder E-Mail existiert bereits.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [insertResult] = await db.promise().execute(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );

    req.session.userId = insertResult.insertId;
    req.session.email = email;
    req.session.role = 'user';

    req.session.save((err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: 'Session konnte nicht gespeichert werden'
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Registrierung erfolgreich.'
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Serverfehler'
    });
  }
});

module.exports = router;
