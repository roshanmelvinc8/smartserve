const express = require('express');
const { verifyJWT, roleRequired } = require('../utils/roleRequired');
const { getNextToken } = require('../utils/tokenGenerator');
const router = express.Router();

router.post('/generate-token', verifyJWT, roleRequired('student'), (req, res) => {
  const { service } = req.body;

  if (!['Bonafide', 'Transfer', 'Fee'].includes(service)) {
    return res.status(400).json({ msg: 'service must be one of Bonafide, Transfer, Fee' });
  }

  const studentId = req.user.sub;
  const student = req.app.db.findUser({ _id: studentId });

  if (!student) {
    return res.status(404).json({ msg: 'student not found' });
  }

  const tokenNumber = getNextToken(req.app.db, service);
  const tokenDoc = {
    student_id: studentId,
    student_name: student.name,
    service,
    token_number: tokenNumber,
    status: 'Waiting',
    created_at: new Date().toISOString()
  };

  const result = req.app.db.insertToken(tokenDoc);
  tokenDoc._id = result.insertedId;

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
