const express = require('express');
const { verifyJWT, roleRequired } = require('../utils/roleRequired');
const router = express.Router();

router.get('/all-tokens', verifyJWT, roleRequired('admin'), (req, res) => {
  const tokens = req.app.db
    .findTokens({})
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  res.json({ tokens });
});

router.get('/analytics', verifyJWT, roleRequired('admin'), (req, res) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const totalToday = req.app.db
    .findTokens({})
    .filter(t => new Date(t.created_at) >= startOfDay).length;

  res.json({ total_tokens_today: totalToday });
});

module.exports = router;
