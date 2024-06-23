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
    res.json({success: true, data: user[0]});
  } else {
    res.status(404);
    res.json({success: false, message: `User not found`})
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

      res.json({ success: true, message: `You are now following ${targetUser.name}` });
    } else {
      res.status(400);
      res.json({success: false, message: `You have already followed ${targetUser.name}`})
      throw new Error(`You have already followed ${targetUser.name}`);
    }
  } else {
    res.status(404);
    res.json({success: false, message: `User not found`})
    throw new Error("User not found");
  }
});

// @desc    Unfollow a user
// @route   POST /api/users/:id/unfollow
// @access  Private
const unfollowUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const targetUser = await User.findById(req.params.id);

  if (user && targetUser) {
    if (user.following.includes(targetUser._id)) {
      user.following = user.following.filter(followingId => followingId.toString() !== targetUser._id.toString());
      targetUser.followers = targetUser.followers.filter(followerId => followerId.toString() !== user._id.toString());

      await user.save();
      await targetUser.save();

      res.json({ success: true, message: `You have unfollowed ${targetUser.name}` });
    } else {
      res.status(400);
      res.json({success: false, message: `You have already unfollowed ${targetUser.name}`})
      throw new Error(`You have already unfollowed ${targetUser.name}`);
    }
  } else {
    res.status(404);
    res.json({success: false, message: `User not found`})
    throw new Error("User not found");
  }
});

module.exports = {
  getUserProfile,
  followUser,
  unfollowUser,
};
