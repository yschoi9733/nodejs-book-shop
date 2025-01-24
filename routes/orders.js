const express = require('express');
const router = express.Router();
router.use(express.json());

const {
  order,
  getOrders,
  getOrderDetail,
} = require('../controller/OrderController');

router.post('/', order);

router.get('/', getOrders);

router.get('/:id', getOrderDetail);

module.exports = router;
