const express = require('express');
const router = express.Router();
router.use(express.json());

const {
  addCartItem,
  getCartItems,
  removeCartItem
} = require('../controller/CartController');

router.post('/', addCartItem);

router.get('/', getCartItems);

router.delete('/:id', removeCartItem);

module.exports = router;