const db = require("../db"); // Deine DB-Verbindung

async function insertInitialUserData(userId) {

    const standardData = {

    }

    // Das JSON-Paket für den neuen User
    const userData = JSON.stringify({
        theme: "dark",
        profileCompleted1: false, //Wichtige Daten
        profileCompleted2: false,  // Unwichtige Daten

        biometric_data: {
            birthdate: undefined,
            gender: undefined,
            height: undefined,
            weight: undefined,
            
            bmi: undefined //Wird automatisch berechnet
        },

        trainingsplan: {
            firstTime: true
        },
        gripper: {
            firstTime: true,
            isCalibrated: false,
            gripper1: {
                minKg: undefined,
                maxKg: undefined,
                totalTurns: undefined
            }
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
