// backend/routes/auth.js

const express = require('express');
const router = express.Router();

// Example login route
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  res.json({ message: `Logging in ${email}` });
});

router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await admin.auth().createUser({
      email,
      password,
    });

    const userEmailLink = await admin.auth().generateEmailVerificationLink(email, {
       url: `${process.env.FRONTEND_URL}/login`,
      handleCodeInApp: true,
    });

    console.log(`Send this verification link to the user: ${userEmailLink}`);

    res.status(201).json({
      message: 'Signup successful. Verification email sent.',
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || 'Signup failed' });
  }
});

module.exports = router;
