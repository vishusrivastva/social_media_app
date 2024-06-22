const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password")
  .populate('followers', 'name')
  .populate('following', 'name');

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Follow a user
// @route   POST /api/users/:id/follow
// @access  Private
const followUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const targetUser = await User.findById(req.params.id);

  if (user && targetUser) {
    if (!user.following.includes(targetUser._id)) {
      user.following.push(targetUser._id);
      targetUser.followers.push(user._id);

      await user.save();
      await targetUser.save();

      res.json({ message: `You are now following ${targetUser.name}` });
    } else {
      res.status(400);
      throw new Error(`You already follow ${targetUser.name}`);
    }
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

module.exports = {
  getUserProfile,
  followUser,
};
