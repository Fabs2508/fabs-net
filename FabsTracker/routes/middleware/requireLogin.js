function requireLogin(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.json({
      success: false,
      status: 401,
      message: 'Nicht eingeloggt'
    });
  }
  next();
}

module.exports = { requireLogin };