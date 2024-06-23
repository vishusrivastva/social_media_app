const asyncHandler = require('express-async-handler');
const Status = require('../models/statusModel');
const User = require('../models/userModel');
const upload = require('../middlewares/uploadMiddleware');
const multer = require('multer');
const mongoose = require('mongoose');

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
      res.json({ success: false, message: 'File upload error: ' + err.message });
      throw new Error('File upload error: ' + err.message);
    } else if (err) {
      res.status(500);
      res.json({ success: false, message: 'Server error during upload: ' + err.message });
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
    res.status(201).json({ success: true, data: createdStatus});
  });
});

// @desc    Get status by ID
// @route   GET /api/statuses/:id
// @access  Private
const getStatusById = asyncHandler(async (req, res) => {
  const status = await Status.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $lookup: {
        from: 'users',
        localField: 'likes',
        foreignField: '_id',
        as: 'likes'
      }
    },
    {
      $lookup: {
        from: 'comments',
        let: { commentIds: '$comments' },
        pipeline: [
          { $match: { $expr: { $in: ['$_id', '$$commentIds'] } } },
          {
            $lookup: {
              from: 'users',
              localField: 'user',
              foreignField: '_id',
              as: 'user'
            }
          },
          { $unwind: '$user' },
          {
            $project: {
              _id: 1,
              text: 1,
              'user.name': 1,
              createdAt: 1
            }
          }
        ],
        as: 'comments'
      }
    },
    {
      $project: {
        _id: 1,
        text: 1,
        image: 1,
        video: 1,
        'user._id': 1,
        'user.name': 1,
        'likes._id': 1,
        'likes.name': 1,
        comments: 1,
        createdAt: 1
      }
    }
  ]);

  if (status.length > 0) {
    if (req.user._id.toString() === status[0].user._id.toString() || req.user.following.includes(status[0].user._id)) {
      res.json({ success: true, data: status[0]});
    } else {
      res.status(403);
      res.json({ success: false, message: 'You do not follow this user' });
      throw new Error('You do not follow this user');
    }
  } else {
    res.status(404);
    res.json({ success: false, message: 'Status not found' });
    throw new Error('Status not found');
  }
});

// @desc    Get statuses of followed users
// @route   GET /api/statuses
// @access  Private
const getStatuses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('following');
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const statuses = await Status.aggregate([
    { $match: { user: { $in: [...user.following, req.user._id] } } },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user',
        pipeline: [{ $project: { name: 1 } }]
      }
    },
    { $unwind: '$user' },
    {
      $lookup: {
        from: 'users',
        localField: 'likes',
        foreignField: '_id',
        as: 'likes',
        pipeline: [{ $project: { name: 1 } }]
      }
    },
    {
      $lookup: {
        from: 'comments',
        localField: 'comments',
        foreignField: '_id',
        as: 'comments',
        pipeline: [
          {
            $lookup: {
              from: 'users',
              localField: 'user',
              foreignField: '_id',
              as: 'user',
              pipeline: [{ $project: { name: 1 } }]
            }
          },
          { $unwind: '$user' },
          { $project: { _id: 1, text: 1, 'user.name': 1, createdAt: 1 } }
        ]
      }
    },
    {
      $project: {
        _id: 1,
        text: 1,
        image: 1,
        video: 1,
        'user._id': 1,
        'user.name': 1,
        likes: 1,
        comments: 1,
        createdAt: 1
      }
    }
  ]).exec();

  res.json({ success: true, data: statuses});
});
module.exports = {
  createStatus,
  getStatusById,
  getStatuses,
};
