const express = require('express');
const { getUserProfile, followUser, unfollowUser } = require('../controllers/userController');
const router = express.Router();

router.get('/:id', getUserProfile);
router.post('/:id/follow', followUser);
router.post('/:id/unfollow', unfollowUser);

module.exports = router;
