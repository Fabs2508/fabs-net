const express = require('express');
const cors = require('cors');
const session = require('express-session');

const app = express();

app.set('trust proxy', 1); // Bei Einsatz hinter einem Proxy (z.B. Nginx) notwendig

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: "12345",
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    httpOnly: true,
    secure: true,     // nur true bei HTTPS
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24
  }
}));

app.use(cors({
  origin: 'https://fabs-net.com',
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS']
}));



app.get("/init", (req, res) => {
  console.log("user Erkannt")
});


app.listen(3010, '0.0.0.0', () => {
  console.log('Server läuft auf Port ' + 3010);
});