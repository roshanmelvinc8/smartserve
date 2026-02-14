const express = require('express');
const { verifyJWT, roleRequired } = require('../utils/roleRequired');
const { getNextToken } = require('../utils/tokenGenerator');
const router = express.Router();

router.post('/generate-token', verifyJWT, roleRequired('student'), (req, res) => {
  const { service } = req.body;

  console.log('Student requesting token for service:', service);

  if (!['Bonafide', 'Transfer', 'Fee'].includes(service)) {
    return res.status(400).json({ msg: 'service must be one of Bonafide, Transfer, Fee' });
  }

  const studentId = req.user.sub;
  const studentName = req.user.name || 'Unknown Student';

  const tokenNumber = getNextToken(req.app.db, service);
  const tokenDoc = {
    student_id: studentId,
    student_name: studentName,
    service,
    token_number: tokenNumber,
    status: 'Waiting',
    created_at: new Date().toISOString()
  };

  console.log('Creating token:', tokenDoc);
  const result = req.app.db.insertToken(tokenDoc);
  tokenDoc._id = result.insertedId;

  console.log('Token saved. Total tokens now:', req.app.db.data.tokens.length);

  res.status(201).json({ token: tokenDoc });
});

router.get('/my-tokens', verifyJWT, roleRequired('student'), (req, res) => {
  const studentId = req.user.sub;
  const tokens = req.app.db
    .findTokens({ student_id: studentId })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  res.json({ tokens });
});

module.exports = router;
