const express = require('express');
const router = express.Router();
router.use(express.json());

const {
  allBooks,
  bookDetail,
} = require('../controller/BookController');

router.get('/', allBooks); // (카테고리별) 전체 도서 조회

router.get('/:id', bookDetail);

module.exports = router;