function requireLogin(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      success: false,
      message: 'Nicht eingeloggt'
    });
  }
  next();
}

module.exports = { requireLogin };