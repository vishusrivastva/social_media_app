const express = require('express');
const { likeStatus } = require('../controllers/likeController');
const router = express.Router();

router.post('/', likeStatus);

module.exports = router;
