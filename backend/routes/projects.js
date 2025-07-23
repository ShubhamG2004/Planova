// backend/routes/projects.js

const express = require('express');
const router = express.Router();

// Example route
router.get('/', (req, res) => {
  res.json({ message: 'Projects API working' });
});

module.exports = router;
