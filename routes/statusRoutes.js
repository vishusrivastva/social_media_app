const express = require('express');
const { createStatus, getStatusById, getStatuses } = require('../controllers/statusController');
const router = express.Router();

router.post('/', createStatus);
router.get('/:id', getStatusById);
router.get('/', getStatuses);

module.exports = router;
