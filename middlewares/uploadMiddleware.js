// utils/uploadMiddleware.js

const multer = require('multer');
const path = require('path');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "image") {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new Error("Not an image! Please upload an image."), false);
    }
  } else if (file.fieldname === "video") {
    if (file.mimetype.startsWith("video")) {
      cb(null, true);
    } else {
      cb(new Error("Not a video! Please upload a video."), false);
    }
  } else {
    cb(new Error("Unexpected field"), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  }
});

module.exports = upload;