const express = require('express');
const { getUserProfile, followUser } = require('../controllers/userController');
const router = express.Router();

router.get('/:id', getUserProfile);
router.post('/:id/follow', followUser);

module.exports = router;
