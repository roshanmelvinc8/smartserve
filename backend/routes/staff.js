const express = require('express');
const { verifyJWT, roleRequired } = require('../utils/roleRequired');
const { sendWhatsapp } = require('../utils/whatsapp');
const router = express.Router();

router.get('/service-tokens', verifyJWT, roleRequired('staff'), (req, res) => {
  let service = req.user.service;

  if (!service) {
    const staff = req.app.db.findUser({ _id: req.user.sub });
    service = staff.service;
  }

  const tokens = req.app.db
    .findTokens({ service })
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  res.json({ service, tokens });
});

router.put('/update-status', verifyJWT, roleRequired('staff'), (req, res) => {
  const { token_id, status } = req.body;

  if (!token_id || !status) {
    return res.status(400).json({ msg: 'token_id and status are required' });
  }

  const validStatuses = ['Waiting', 'In Progress', 'Completed', 'Cancelled', 'Expired'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ msg: 'invalid status' });
  }

  let service = req.user.service;
  if (!service) {
    const staff = req.app.db.findUser({ _id: req.user.sub });
    service = staff.service;
  }

  const token = req.app.db.findToken({ _id: token_id, service });
  if (!token) {
    return res.status(404).json({ msg: 'token not found for your service' });
  }

  req.app.db.updateToken({ _id: token_id }, { $set: { status } });
  const updated = req.app.db.findToken({ _id: token_id });

  if (status === 'In Progress') {
    sendWhatsapp(updated.student_name, updated.token_number, status);
  }

  res.json({ token: updated });
});

router.put('/expire-tokens', verifyJWT, roleRequired('staff'), (req, res) => {
  let service = req.user.service;
  if (!service) {
    const staff = req.app.db.findUser({ _id: req.user.sub });
    service = staff.service;
  }

  const result = req.app.db.updateManyTokens(
    { service, status: 'Waiting' },
    { $set: { status: 'Expired' } }
  );

  res.json({ expired_count: result.modifiedCount });
});

module.exports = router;
