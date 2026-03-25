// routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ─── Register ────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, userData } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        error: { message: 'Email, password, and role are required', status: 400 }
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        error: { message: 'Password must be at least 6 characters', status: 400 }
      });
    }

    const normalizedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
    if (!['Student', 'Organization'].includes(normalizedRole)) {
      return res.status(400).json({
        error: { message: 'Invalid role. Must be Student or Organization', status: 400 }
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: { message: 'Email already in use', status: 400 }
      });
    }

    const user = new User({ email, password, role: normalizedRole, ...userData });
    await user.save();
    const token = generateToken(user._id);

    console.log('✅ User registered:', user._id);
    res.status(201).json({ message: 'User registered successfully', token, user: user.toJSON() });
  } catch (error) {
    console.error('Register error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: { message: 'Email already in use', status: 400 } });
    }
    res.status(500).json({ error: { message: 'Registration failed', status: 500 } });
  }
});

// ─── Login ───────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: { message: 'Email and password are required', status: 400 }
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: { message: 'Invalid email or password', status: 401 }
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: { message: 'Invalid email or password', status: 401 }
      });
    }

    const token = generateToken(user._id);
    console.log('✅ Login successful:', user._id);
    res.status(200).json({ message: 'Login successful', token, user: user.toJSON() });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: { message: 'Login failed', status: 500 } });
  }
});

// ─── Google OAuth ─────────────────────────────────────────────────────────────
// POST /api/auth/google
// Body: { idToken: string, role: 'Student' | 'Organization' }
//
// Flow:
//  1. Verify the Google ID token using google-auth-library
//  2. If user exists → log them in (role must match)
//  3. If user doesn't exist → create account using Google profile data
//  4. Return same { token, user } shape as /login and /register
router.post('/google', async (req, res) => {
  try {
    const { idToken, role } = req.body;

    if (!idToken || !role) {
      return res.status(400).json({
        error: { message: 'Google ID token and role are required', status: 400 }
      });
    }

    const normalizedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
    if (!['Student', 'Organization'].includes(normalizedRole)) {
      return res.status(400).json({
        error: { message: 'Invalid role. Must be Student or Organization', status: 400 }
      });
    }

    // Verify Google ID token
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (verifyError) {
      console.error('Google token verification failed:', verifyError.message);
      return res.status(401).json({
        error: { message: 'Invalid Google token', status: 401 }
      });
    }

    const { email, given_name, family_name, name, picture, sub: googleId } = payload;

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      // Existing user: verify role matches
      if (user.role !== normalizedRole) {
        return res.status(403).json({
          error: {
            message: `This account is registered as ${user.role}. Please use the ${user.role} login.`,
            status: 403
          }
        });
      }
      // Update Google ID and profile image if not already set
      if (!user.googleId) {
        user.googleId = googleId;
        if (picture && !user.profileImage) user.profileImage = picture;
        await user.save();
      }
    } else {
      // New user: create account from Google profile
      const userData = {
        email,
        googleId,
        role: normalizedRole,
        profileImage: picture || '',
        // No password needed for OAuth users — set a random unusable one
        password: `google_oauth_${googleId}_${Date.now()}`,
      };

      if (normalizedRole === 'Student') {
        userData.firstName = given_name || '';
        userData.lastName = family_name || '';
        userData.fullName = name || email;
      } else {
        // Organization: use Google display name as org name (user can update later)
        userData.organizationName = name || email;
      }

      user = new User(userData);
      await user.save();
      console.log('✅ New user via Google OAuth:', user._id);
    }

    const token = generateToken(user._id);
    console.log('✅ Google OAuth login:', user._id);

    res.status(200).json({
      message: 'Google sign-in successful',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({ error: { message: 'Google sign-in failed', status: 500 } });
  }
});

// ─── Verify Token ─────────────────────────────────────────────────────────────
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: { message: 'No token provided', status: 401 } });
    }
    const token = authHeader.split('Bearer ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: { message: 'User not found', status: 404 } });
    }
    res.status(200).json({ valid: true, user: user.toJSON() });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(403).json({ error: { message: 'Invalid token', status: 403 } });
  }
});

module.exports = router;