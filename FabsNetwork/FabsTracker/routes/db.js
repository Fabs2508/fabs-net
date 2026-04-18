require('dotenv').config({ path: '/var/www/html/FabsTracker/.env' });
const mysql = require("mysql2");

const db = mysql.createPool({
  host: process.env.HOST,
  user: process.env.DB_USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  connectionLimit: 10
});

/*
db.connect((err) => {
  if (err) {
    console.error("DB Fehler:", err);
  } else {
    console.log("DB verbunden");
  }
});
*/

module.exports = db;