const express = require('express');
const router = express.Router();
router.use(express.json());

const { addLike, removeLike } = require('../controller/LikeController');

router.post('/:id', addLike);

router.delete('/:id', removeLike);

module.exports = router;
