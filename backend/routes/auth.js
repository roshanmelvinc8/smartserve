const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, userId, role } = req.body;

  if (!username || !userId || !role) {
    return res.status(400).json({ msg: 'username, userId, and role required' });
  }

  // Validate role
  if (!['student', 'staff', 'admin'].includes(role)) {
    return res.status(400).json({ msg: 'invalid role' });
  }

  // Create user object for JWT
  const user = {
    _id: username,
    name: username,
    username: username,
    userId: userId,
    role: role,
    service: null
  };

  const accessToken = jwt.sign(
    { role: user.role, name: user.name, service: user.service || null },
    process.env.JWT_SECRET_KEY || 'super-secret-key',
    { subject: user._id }
  );

  res.json({
    access_token: accessToken,
    user: {
      _id: user._id,
      name: user.name,
      username: user.username,
      userId: user.userId,
      role: user.role,
      service: user.service
    }
  });
});

module.exports = router;
