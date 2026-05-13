const express = require("express");
const router = express.Router();
const db = require("./db");

// Registrierung
router.post('/', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            success: false,
            message: 'Nicht autorisiert.'
        });
    }
    try {

        const { birthdate, gender, height, weight } = req.body;
        const userId = req.session.userId;
        
        const biometricData = JSON.stringify({ birthdate, gender, height, weight });

        await db.promise().execute(
            `UPDATE users 
             SET userData = JSON_SET(
                userData, 
                '$.biometric_data', JSON_QUERY(?, '$'), 
                '$.profileCompleted1', true
             ) 
             WHERE id = ?`,
            [biometricData, userId]
        );

        return res.status(200).json({
            success: true,
            message: 'BM erfolgreich.',
            status: 200
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