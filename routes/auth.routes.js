const router = require('express').Router();
const User = require('../Models/Users');
const Organization = require('../Models/Organization');
const { createSlug } = require('../utils/slugify');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = "MY_SUPER_SECRET_KEY";

// router.post('/login', async (req, res) => {
//   const { email, name } = req.body;

//   let user = await User.findOne({ email });
//   if (!user) {
//     user = await User.create({ email, name });
//   }

//   let org = await Organization.findOne({ owner: user._id });
//   if (!org) {
//     org = await Organization.create({
//       name: `${name}'s Projects`,
//       slug: createSlug(`${name}-projects`),
//       owner: user._id
//     });
//   }

//   res.json({
//     token: 'fake-jwt',
//     user,
//     org
//   });
// });

router.post('/register', async (req, res) => {
  try {
    console.log('Register request received:', req.body);
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields: name, email, password' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({ name, email, password: hashedPassword });

    // Create organization for user
    let org = await Organization.findOne({ owner: user._id });
    if (!org) {
      org = await Organization.create({
        name: `${name}'s Projects`,
        slug: createSlug(`${name}-projects`),
        owner: user._id
      });
    }

    console.log('User registered successfully:', user.email);
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    res.json({
      message: 'User registered successfully',
      token: token,
      user: { id: user._id, name: user.name, email: user.email },
      org
    });
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Missing email or password' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // ✅ USE user.name
    const displayName = user.name;

    let org = await Organization.findOne({ owner: user._id });

    if (!org) {
      org = await Organization.create({
        name: `${displayName}'s Projects`,
        slug: createSlug(`${displayName}-projects`),
        owner: user._id
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: 'Login successful',
      token: token,
      user: { id: user._id, name: user.name, email: user.email },
      org
    });

  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
