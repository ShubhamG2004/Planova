// backend/controllers/authController.js
const { auth } = require('../config/firebase');

exports.verifyTokenAndRespond = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: 'Token missing' });
  }

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    const { uid, email, name } = decodedToken;

    // Optional: create a session, store user, etc.
    return res.status(200).json({
      uid,
      email,
      name,
      message: 'Token verified successfully',
    });
  } catch (err) {
    console.error('Token verification failed:', err);
    return res.status(401).json({ message: 'Invalid token', error: err.message });
  }
};
