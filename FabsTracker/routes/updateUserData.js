const express = require('express');
const router = express.Router();
const db = require('./db'); // Pfad zu deiner db.js
const { requireLogin } = require('./middleware/requireLogin');

router.post('/', requireLogin, (req, res) => {
    const userId = req.session.userId;
    const newData = req.body; // Das ist das Objekt { gripper: { ... } }

    if (!newData || typeof newData !== 'object') {
        return res.status(400).json({ success: false, message: 'Ungültige Daten' });
    }

    // Wir nutzen JSON_MERGE_PATCH, um nur die gesendeten Felder zu aktualisieren
    const sql = `
        UPDATE users 
        SET userData = JSON_MERGE_PATCH(COALESCE(userData, '{}'), ?) 
        WHERE id = ?
    `;

    db.query(sql, [JSON.stringify(newData), userId], (err, result) => {
        if (err) {
            console.error('Fehler beim Update der userData:', err);
            return res.status(500).json({ success: false, message: 'Datenbankfehler' });
        }

        res.json({ success: true, message: 'Daten erfolgreich aktualisiert' });
    });
});

module.exports = router;
