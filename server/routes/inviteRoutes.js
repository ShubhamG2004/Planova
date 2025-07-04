const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware'); // ✅ Correct if file path is right

const {
  getInvitesForUser,
  respondToInvite,
  sendInvite
} = require('../controllers/inviteController');

// GET /api/invites
router.get('/', auth, getInvitesForUser);

// POST /api/invites/:id/respond
router.post('/:id/respond', auth, respondToInvite);

// POST /api/invites/:projectId
router.post('/:projectId', auth, sendInvite);

module.exports = router;
