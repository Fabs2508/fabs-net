const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.post("/init", (req, res) => {
    const daten = req.body; // Hier landen deine JSON-Daten aus dem Frontend
    console.log("Erhaltene Daten:", daten);
    
    // Sende EINE Antwort zurück
    res.json({ 
        status: "erfolgreich", 
        nutzer: daten.username 
    });
});


app.listen(3001, () => console.log("Server läuft auf Port 3001"));