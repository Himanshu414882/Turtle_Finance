const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Client = require('../models/client'); //
const Advisor = require('../models/advisor'); //
const router = express.Router();
require('dotenv').config();


// Helper: Create JWT and send it in cookie
const sendTokenResponse = (user, res) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: false,          // ⚠️ must be false for localhost (no https)
    sameSite: 'Lax',        // 'Lax' is fine for most local setups nhi to "None"
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  res.json({ success: true, role: user.role });
};

// GET /auth/check-auth
router.get('/check-auth', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ role: decoded.role });
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
});



// Local login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err || !user) return res.status(400).json({ message: 'Login failed' });
    sendTokenResponse(user, res);
  })(req, res, next);
});


// Register
/*router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    let existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password, role });
    sendTokenResponse(user, res); // Sends cookie and user info
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});*/




router.post('/register', async (req, res) => {
  const { name, email, password, role, clientType } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const allowedRoles = ['admin', 'client', 'advisor'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role specified' });
  }

  try {
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

   
    const user = await User.create({ name, email, password, role });

    // If user is a client, also add to Client model
    if (role === 'client') {
      try {
        await Client.create({ userId: user._id, fullName: name, email: email, clientType: clientType});
      } catch (clientErr) {
        // Roll back user if client creation fails
        await User.findByIdAndDelete(user._id);
        return res.status(500).json({
          message: 'Client creation failed, user rolled back',
          error: clientErr.message
        });
      }
    
     // await Client.create({ user: user._id, fullName:name, email:email, clientType:clientType });
    }
    else if(role === 'advisor'){
      try {
        await Advisor.create({ userId: user._id, advisorFullName: name, email: email});
      } catch (advisorErr) {
        // Roll back user if client creation fails
        await User.findByIdAndDelete(user._id);
        return res.status(500).json({
          message: 'Advisor creation failed, user rolled back',
          error: advisorErr.message
        });
      }
    }
   

    sendTokenResponse(user, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed' });
  }
});


// Google login
// router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// router.get('/google/callback',
//   passport.authenticate('google', { session: false, failureRedirect: '/login' }),
//   (req, res) => {
//     sendTokenResponse(req.user, res);
//     // Redirect or respond as needed
//     res.redirect('http://localhost:5173/redirect');
//   }
// );

// Logout (clear cookie)
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out' });
});

module.exports = {
  authRoutes: router
}
