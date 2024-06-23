const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const { generateToken } = require('../utils/generateToken');
const { hashPassword } = require('../utils/hashPassword');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    res.json({ success: false, message: 'User already exists' });
    throw new Error('User already exists');
  }

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  if (user) {
    res.status(201).json({success: true, data :{
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    }});
  } else {
    res.status(400);
    res.json({ success: false, message: 'Invalid user data' });
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({success: true, data :{
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    }});
  } else {
    res.status(401);
    res.json({ success: false, message: 'Invalid email or password' });
    throw new Error('Invalid email or password');
  }
});

module.exports = {
  registerUser,
  authUser,
};
