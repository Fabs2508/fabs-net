const express = require('express');
const cors = require('cors');
const session = require('express-session');

const os = require('os');
const fs = require("fs");

const app = express();

const { requireAdmin } = require("./routes/middleware/requireAdmin");

const db = require('./routes/db');

const loginRoutes = require('./routes/login');
const registerRoutes = require('./routes/register');
const completeProfileRoutes = require('./routes/completeProfile');
const logoutRoutes = require('./routes/logout');
const adminRoutes = require('./routes/admin/index');
const meRoutes = require('./routes/me');

const getUserStatusRoutes = require('./routes/getUserStatus');
const getUserDataRoutes = require('./routes/getUserData');
const updateUserDataRoutes = require('./routes/updateUserData');
const updateThemeRoutes = require("./routes/updateTheme");

const heartbeatRoutes = require("./routes/heartbeat");

const homeRoutes = require('./routes/home/index');
const profileRoutes = require('./routes/profile');

const testRoutes = require('./routes/test');
const pingRoutes = require('./routes/ping');


require('dotenv').config({ path: '/var/www/html/FabsTracker/.env' });

app.set('trust proxy', 1); // Bei Einsatz hinter einem Proxy (z.B. Nginx) notwendig

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
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

app.use("/login", loginRoutes);
app.use("/register", registerRoutes);
app.use("/completeProfile", completeProfileRoutes);
app.use("/logout", logoutRoutes);
app.use("/admin", adminRoutes);
app.use("/me", meRoutes);
app.use("/getUserStatus", getUserStatusRoutes);
app.use("/getUserData", getUserDataRoutes);
app.use("/updateUserData", updateUserDataRoutes)
app.use("/updateTheme", updateThemeRoutes);

app.use("/heartbeat", heartbeatRoutes);

app.use("/home", homeRoutes);
app.use("/profile", profileRoutes);


app.use("/test", testRoutes);
app.use("/ping", pingRoutes);


app.get("/", (req, res) => {
  res.redirect("/ping");
});


app.get('/admin/users', requireAdmin, (req, res) => {
  db.query(
    'SELECT id, username, email, role, last_seen FROM users',
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: 'Serverfehler'
        });
      }
      return res.status(200).json({
        success: true,
        users: results
      });
    }
  );
});

app.get("/temp", (req, res) => {
    try {
        const tempRaw = fs.readFileSync("/sys/class/thermal/thermal_zone0/temp", "utf8");
        // Umrechnung: 63783 -> 63.8
        const tempCelsius = (parseInt(tempRaw) / 1000).toFixed(1); 
        
        res.json({ 
            celsius: tempCelsius 
        });
    } catch (err) {
        res.status(500).send("Fehler beim Lesen der Temperatur");
    }
});



app.listen(process.env.PORT, '0.0.0.0', () => {
  console.log('Server läuft auf Port ' + process.env.PORT);
});


//domain und port ans Frontend senden | Bleibt hier
app.get('/config', (req, res) => {
  res.json({
    appDOMAIN: process.env.DOMAIN,
    appPORT: process.env.PORT
  });
});