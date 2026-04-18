const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'fabuser',
  password: '1234',
  database: 'gymapp'
});

// Registrierung
app.post('/register', async (req, res) => {

    const { username, email, password } = req.body;

  //  Prüfen ob Email existiert
  db.query(
    'SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Fehler');
      }

      // Email existiert schon
      if (results.length > 0) {
        return res.send('3'); //Email bereits vergeben
      }

      // ✅ Email frei → User erstellen und verschlüsseln
      try {
        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(
          'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
          [username, email, hashedPassword],
          (err, result) => {
            if (err) {
              console.error(err);
              return res.status(500).send('1'); // Fehler bei INSERT
            }

            res.send('2'); // User erstellt
          }
        );
      }catch (error) {
        console.error(error);
        return res.status(500).send('18'); // Fehler beim Hashen
      }
    }
  );
});

// Login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  //const sql = 'SELECT * FROM users WHERE email = ?';

  db.query('SELECT * FROM users WHERE email = ?', [email], 
    async (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send('1'); //Fehler beim Login
      }

      if (results.length === 0) {
        return res.send('3'); //Email oder Passwort falsch!
      }

      const user = results[0];

      console.log('Eingegebenes Passwort:', password);
      console.log('Hash aus DB:', user.password);

      try {
        const match = await bcrypt.compare(password, user.password);
        console.log('MATCH:', match);

        if (match) {
        res.send('2'); //Login erfolgreich!
      } else {
        res.send('3'); //Email oder Passwort falsch!
      }
      } catch (error) {
        console.error(error);
        res.status(500).send('1'); //Fehler beim Vergleichen
      }
  });
});

app.listen(3000, '0.0.0.0', () => {
  console.log('Server läuft auf Port 3000');
});