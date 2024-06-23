const asyncHandler = require('express-async-handler');
const Status = require('../models/statusModel');

// @desc    Like a status
// @route   POST /api/likes
// @access  Private
const likeStatus = asyncHandler(async (req, res) => {
  const { statusId } = req.body;

  const status = await Status.findById(statusId);

  if (status) {
    if(req.user._id.toString() === status.user.toString() || req.user.following.includes(status.user)){
      if (!status.likes.includes(req.user._id)) {
        status.likes.push(req.user._id);
        await status.save();
        res.json({ success: true, message: 'Status liked' });
      } else {
        res.status(400);
        res.json({success: false, message: 'You already liked this status'})
        throw new Error('You already liked this status');
      }
    } else {
      res.status(403);
      res.json({success: false, message: 'You do not follow this user'})
      throw new Error('You do not follow this user');
    }
    }
    else {
      res.status(404);
      res.json({success: false, message: 'Status not found'})
      throw new Error('Status not found');
    }
    
});

module.exports = {
  likeStatus,
};
