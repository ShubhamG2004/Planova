const express = require('express');
const router = express.Router();
const passport = require('passport');
const { generateToken } = require('../config/passport');
const User = require('../models/User');

// Helper for consistent error responses
const handleError = (res, status, message) => {
  return res.status(status).json({ success: false, message });
};

// User Registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return handleError(res, 400, 'All fields are required');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return handleError(res, 400, 'Email already registered');
    }

    const user = await User.create({ name, email, password, provider: 'local' });
    const token = generateToken(user);

    return res.status(201).json({
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

// User Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) {
      console.error('Login error:', err);
      return handleError(res, 500, 'Authentication error');
    }
    if (!user) {
      return handleError(res, 401, info?.message || 'Invalid credentials');
    }

    const token = generateToken(user);
    return res.json({
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

// Google OAuth
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false
}));

router.get('/google/callback', 
  passport.authenticate('google', { 
    session: false,
    failureRedirect: '/login?error=google_auth_failed'
  }),
  (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
  }
);

// GitHub OAuth
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
    res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
  }
);

// Current User
// Add this to your auth routes
router.get('/me', 
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          message: 'Not authenticated' 
        });
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
    } catch (err) {
      console.error('Error in /me route:', err);
      res.status(500).json({ 
        success: false,
        message: 'Failed to fetch user data'
      });
    }
  }
);
module.exports = router;