const asyncHandler = require('express-async-handler');
const Comment = require('../models/commentModel');
const Status = require('../models/statusModel');

// @desc    Create a new comment
// @route   POST /api/comments
// @access  Private
const createComment = asyncHandler(async (req, res) => {
  const { statusId, text } = req.body;

  const status = await Status.findById(statusId);

  if (status) {
    if(req.user._id.toString() === status.user.toString() || req.user.following.includes(status.user)){
      const comment = new Comment({
        user: req.user._id,
        status: statusId,
        text,
      });
  
      const createdComment = await comment.save();
  
      status.comments.push(createdComment._id);
      await status.save();
  
      res.status(201).json(createdComment);
    } else {
      res.status(404);
      throw new Error('You do not follow this user');
    }
    
  } else {
    res.status(404);
    throw new Error('Status not found');
  }
});

module.exports = {
  createComment,
};
