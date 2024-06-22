const mongoose = require('mongoose');

const statusSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    text: String,
    image: String,
    video: String,
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  },
  { timestamps: true }
);

statusSchema.index({ createdAt: -1 });

const Status = mongoose.model('Status', statusSchema);

module.exports = Status;