const express = require('express');
const router = express.Router();
const passport = require('passport');
const { generateToken } = require('../config/passport');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// Utility for consistent error responses
const handleError = (res, status, message) => {
  return res.status(status).json({ success: false, message });
};

// =========================
// Register (Local)
// =========================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return handleError(res, 400, 'All fields are required');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return handleError(res, 400, 'Email already registered');
    }

    const user = await User.create({ name, email, password, provider: 'local' });
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    return handleError(res, 500, 'Registration failed');
  }
});

// =========================
// Login (Local)
// =========================
router.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) return handleError(res, 500, 'Authentication error');
    if (!user) return handleError(res, 401, info?.message || 'Invalid credentials');

    const token = generateToken(user);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  })(req, res, next);
});

// =========================
// Google OAuth
// =========================
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false
}));

router.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/auth/login?error=google_auth_failed'
  }),
  (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
  }
);

// =========================
// GitHub OAuth
// =========================
router.get('/github', passport.authenticate('github', {
  scope: ['user:email'],
  session: false
}));

router.get('/github/callback',
  passport.authenticate('github', {
    session: false,
    failureRedirect: '/login?error=github_auth_failed'
  }),
  (req, res) => {
    const token = generateToken(req.user);

    // ✅ Redirect user to your frontend after login success
    res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
  }
);


// =========================
// Current User Info (/me)
// =========================
router.get('/me',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar
      }
    });
  }
);

// =========================
// Get All Users (Protected)
// =========================
router.get('/users', authMiddleware, async (req, res) => {
  try {
    const users = await User.find({}, 'name email');
    res.json(users);
  } catch (err) {
    console.error('Failed to fetch users:', err);
    res.status(500).json({ message: 'Failed to load users' });
  }
});

module.exports = router;
