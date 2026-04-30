const express = require('express');
const router = express.Router();
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profile/');
  },
  filename: (req, file, cb) => {
    cb(null, req.session.userId + '.png');
  }
});

const upload = multer({ storage });

router.post('/upload', upload.single('image'), (req, res) => {
  const path = `/uploads/profile/${req.session.userId}.png`;

  db.query(
    "UPDATE users SET profile_image = ? WHERE id = ?",
    [path, req.session.userId],
    (err) => {
      if (err) return res.json({ success: false });

      res.json({
        success: true,
        path
      });
    }
  );
});

module.exports = router;