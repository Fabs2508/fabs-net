const db = require("../db");

function requireAdmin(req, res, next) {

  if (!req.session || !req.session.userId){
    return res.status(401).json({
      success: false,
      message: 'Nicht autorisiert'
    });
  }

   db.query(
    'SELECT role FROM users WHERE id = ?',
    [req.session.userId],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: 'Serverfehler'
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User nicht gefunden'
        });
      }

      if (results[0].role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Kein Zugriff'
        });
      }
      next();
    }
  );
}

module.exports = { requireAdmin };