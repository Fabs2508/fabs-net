const db = require("../db"); // Deine DB-Verbindung

async function insertInitialUserData(userId) {

    const standardData = {

    }

    // Das JSON-Paket für den neuen User
    const userData = JSON.stringify({
        gripper: {
            minKg: 5,
            maxKg: 60,
            totalTurns: 0,
            isCalibrated: false
        }
    });

    // HIER passiert das INSERT (bzw. UPDATE, da der User-Eintrag ja schon existiert)
    // Wir füllen die Spalte userData für die gerade erstellte ID
    const [result] = await db.promise().execute(
        "UPDATE users SET userData = ?, last_login = NOW() WHERE id = ?",
        [userData, userId]
    );

    if (result.affectedRows === 0) {
        return { success: false, status: "NOT_FOUND" };
    }

    return { success: true, status: "UPDATED" };
}

module.exports = { insertInitialUserData };
