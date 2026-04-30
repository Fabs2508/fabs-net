const readline = require('readline');
const db = require('../db'); // Pfad zu deiner db.js anpassen

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('SIGINT', () => {
  console.log('\nProgramm beendet.');
  rl.close();
  process.exit(0);
});

async function run() {
  rl.question('FabsTracker CLI > ', async (input) => {
    const trimmedInput = input.trim();

    if (!trimmedInput) {
      return run();
    }

    // 1. Regex für den Befehl: set <id> <pfad> <wert>
    // Beispiel: set 1 gripper.isCalibrated true
    const setRegex = /^set\s+(\d+)\s+([\w.]+)\s+(.+)$/i;
    const match = trimmedInput.match(setRegex);

    if (match) {
      const userId = match[1];
      const path = match[2];
      let value = match[3];

      // Typ-Konvertierung (String zu Boolean/Number)
      if (value.toLowerCase() === 'true') value = true;
      else if (value.toLowerCase() === 'false') value = false;
      else if (!isNaN(value)) value = Number(value);

      await updateUserDataInDB(userId, path, value);
      return run();
    }

    // 2. Klassische Switch-Cases für einfache Befehle
    switch (trimmedInput.toLowerCase()) {
      case "help":
        console.log("\nBefehle:");
        console.log("  set <id> <pfad> <wert>  - Ändert einen Wert im userData JSON");
        console.log("  exit                    - Beendet das Programm\n");
        break;
      case "exit":
        rl.close();
        process.exit(0);
        break;
      default:
        console.log(`⚠️ Unbekannter Befehl: ${trimmedInput}`);
    }

    run();
  });
}

async function updateUserDataInDB(userId, path, value) {
  // Verwandelt gripper.isCalibrated in $.gripper.isCalibrated für SQL
  const sqlPath = `$.${path}`;
  
  const sql = `
    UPDATE users 
    SET userData = JSON_SET(COALESCE(userData, '{}'), ?, ?) 
    WHERE id = ?
  `;

  return new Promise((resolve) => {
    db.query(sql, [sqlPath, value, userId], (err, result) => {
      if (err) {
        console.error(`❌ Fehler: ${err.message}`);
      } else if (result.affectedRows === 0) {
        console.log(`⚠️ User mit ID ${userId} nicht gefunden.`);
      } else {
        console.log(`✅ User ${userId}: ${path} wurde auf ${value} gesetzt.`);
      }
      resolve();
    });
  });
}

console.log("--- FabsTracker Admin Console ---");
run();
