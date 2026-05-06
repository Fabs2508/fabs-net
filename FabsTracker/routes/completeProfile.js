const express = require("express");
const router = express.Router();
const db = require("./db");

// Registrierung
router.post('/', async (req, res) => {
    console.log("yay");
    try {
        const { birthdate, gender, height, weight } = req.body;

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

        const userId = insertResult.insertId;

        const { insertInitialUserData } = require('./utils/initUser');
        await insertInitialUserData(userId);

        req.session.userId = userId;
        req.session.email = email;
        req.session.role = 'user';

        req.session.save((err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
            success: false,
            message: 'Session konnte nicht gespeichert werden',
            status: 500
            });
        }

        return res.status(201).json({
            success: true,
            message: 'Registrierung erfolgreich.',
            status: 201
        });
        });

        
    } catch (error) {
        console.error(error);
        return res.status(500).json({
        success: false,
        message: 'Serverfehler',
        status: 500
        });
    }
});

module.exports = router;