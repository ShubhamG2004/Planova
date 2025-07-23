// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { verifyTokenAndRespond } = require('../controllers/authController');

router.post('/login', verifyTokenAndRespond); // email/password or Google

module.exports = router;
