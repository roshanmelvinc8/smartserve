const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: 'email and password required' });
  }

  const user = req.app.db.findUser({ email, password });

  if (!user) {
    return res.status(401).json({ msg: 'invalid credentials' });
  }

  const accessToken = jwt.sign(
    { role: user.role, service: user.service || null },
    process.env.JWT_SECRET_KEY || 'super-secret-key',
    { subject: user._id }
  );

  res.json({
    access_token: accessToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      service: user.service
    }
  });
});

module.exports = router;
