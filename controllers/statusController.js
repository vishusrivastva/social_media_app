const asyncHandler = require('express-async-handler');
const Status = require('../models/statusModel');
const User = require('../models/userModel');
const upload = require('../middlewares/uploadMiddleware');
const multer = require('multer'); 

// @desc    Create a new status
// @route   POST /api/statuses
// @access  Private
const createStatus = asyncHandler(async (req, res) => {
  const uploadFields = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 }
  ]);

  uploadFields(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      res.status(400);
      throw new Error('File upload error: ' + err.message);
    } else if (err) {
      res.status(500);
      throw new Error('Server error during upload: ' + err.message);
    }

    const { text } = req.body;
    let image, video;

    if (req.files) {
      if (req.files['image']) {
        image = req.files['image'][0].path;
      }
      if (req.files['video']) {
        video = req.files['video'][0].path;
      }
    }

    const status = new Status({
      user: req.user._id,
      text,
      image,
      video,
    });

    const createdStatus = await status.save();
    res.status(201).json(createdStatus);
  });
});

// @desc    Get status by ID
// @route   GET /api/statuses/:id
// @access  Private
const getStatusById = asyncHandler(async (req, res) => {
  const status = await Status.findById(req.params.id)
    .populate('user', 'name')
    .populate('likes', 'name')
    .populate('comments', 'text');

  if (status) {
    if(req.user._id.toString() === status.user._id.toString() || req.user.following.includes(status.user._id)){
      res.json(status);
    } else {
      res.status(404);
      throw new Error('You do not follow this user');
    }
    
  } else {
    res.status(404);
    throw new Error('Status not found');
  }
});

// @desc    Get statuses of followed users
// @route   GET /api/statuses
// @access  Private
const getStatuses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const statuses = await Status.find({ user: { $in: [...user.following, user._id] } })
    .populate('user', 'name')
    .populate('likes', 'name')
    .populate('comments', 'text')
    .sort({ createdAt: -1 });

  res.json(statuses);
});

module.exports = {
  createStatus,
  getStatusById,
  getStatuses,
};
