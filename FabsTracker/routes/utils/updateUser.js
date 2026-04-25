const { insertInitialUserData } = require('./initUser');
const readline = require('readline');

// Interface für die Konsole erstellen
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('SIGINT', () => {
  console.log('\n');
  rl.close();
  process.exit(0);
});

async function run() {
  // Abfrage in der Konsole
  rl.question('Bitte gib die User-ID ein: ', async (userId) => {

    if (!userId.trim()) {
      console.log(`\n⚠️  Status: NO_INPUT | Keine ID eingegeben \n`);
      return run();
    }

    try {
      console.log(`Initialisiere Daten für User ${userId}...`);
      
      const result = await insertInitialUserData(userId);
      
      if (result.success === true) {
        console.log(`\n✅ Status: ${result.status} | Daten für User ${userId} wurden angelegt. \n`);
        rl.close(); // Schließt die Eingabezeile
        process.exit(1);
      } else if (result.status === "NOT_FOUND"){
        console.log(`\n⚠️  Status: ${result.status} | User mit ID ${userId} existiert nicht in der Datenbank. \n`);
        return run();
      }
    } catch (err) {
      console.error("❌ Fehler bei der Ausführung:", err);
      rl.close(); // Schließt die Eingabezeile
      process.exit(1);
    }
  });
}

run();