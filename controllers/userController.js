const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const mongoose = require('mongoose');

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
    {
      $lookup: {
        from: 'users',
        localField: 'followers',
        foreignField: '_id',
        as: 'followers'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'following',
        foreignField: '_id',
        as: 'following'
      }
    },
    {
      $project: {
        _id: 1,
        name: 1,
        email: 1,
        'followers._id': 1,
        'followers.name': 1,
        'following._id': 1,
        'following.name': 1,
        followersCount: { $size: '$followers' },
        followingCount: { $size: '$following' }
      }
    }
  ]);

  if (user.length > 0) {
    res.json(user[0]);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

module.exports = {
  getUserProfile,
};
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
