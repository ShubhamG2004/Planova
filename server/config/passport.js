const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ==========================
// JWT Strategy
// ==========================
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}, async (payload, done) => {
  try {
    const user = await User.findById(payload.id).select('-password');
    return done(null, user || false);
  } catch (err) {
    done(err, false);
  }
}));

// ==========================
// Local Strategy
// ==========================
passport.use(new LocalStrategy({
  usernameField: 'email'
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return done(null, false, { message: 'Invalid credentials' });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// ==========================
// Google Strategy (optional)
// ==========================
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;
    const avatar = profile.photos?.[0]?.value;

    const user = await User.findOneAndUpdate(
      { email },
      {
        name: profile.displayName,
        email,
        avatar,
        provider: 'google'
      },
      { upsert: true, new: true }
    );
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

// ==========================
// ✅ GitHub Strategy
// ==========================
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: '/api/auth/github/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;
    const avatar = profile.photos?.[0]?.value;

    const user = await User.findOneAndUpdate(
      { email },
      {
        name: profile.displayName || profile.username,
        email,
        avatar,
        provider: 'github'
      },
      { upsert: true, new: true }
    );

    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

// ==========================
// JWT Token Generator
// ==========================
const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '30d' // ✅ Session lasts 30 days
  });
};

module.exports = {
  passport,
  generateToken
};
