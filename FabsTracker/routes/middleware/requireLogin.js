function requireLogin(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.json({
      success: false,
      message: 'Nicht eingeloggt',
      status: 401
    });
  }
  next();
}

module.exports = { requireLogin };