const mysql = require('mysql2/promise');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const ensureAuthorization = require('../auth');

const order = async (req, res) => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'bookShop',
    dateStrings: true,
  });

  const { items, delivery, totalQuantity, totalPrice, firstBookTitle } =
    req.body;

  const authorization = ensureAuthorization(req);

  if (authorization instanceof jwt.TokenExpiredError) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: '로그인 세션이 만료되었습니다. 다시 로그인 하세요',
    });
  } else if (authorization instanceof jwt.JsonWebTokenError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: '잘못된 토큰입니다.',
    });
  } else if (authorization instanceof ReferenceError) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: '로그인을 해주세요',
    });
  }

  let sql = `INSERT INTO delivery (address, receiver, contact) VALUES (?, ?, ?)`;
  let values = [delivery.address, delivery.receiver, delivery.contact];
  let [result] = await conn.execute(sql, values);
  let deliveryId = result.insertId;

  sql = `INSERT INTO orders (book_title, total_quantity, total_price, user_id, delivery_id) 
    VALUES (?, ?, ?, ?, ?)`;
  values = [
    firstBookTitle,
    totalQuantity,
    totalPrice,
    authorization.id,
    deliveryId,
  ];
  [result] = await conn.execute(sql, values);
  let orderId = result.insertId;

  sql = `SELECT book_id, quantity FROM cartItems WHERE id IN (?)`;
  values = items;
  let [orderItems, fields] = await conn.query(sql, [values]);

  sql = `INSERT INTO orderedBook (order_id, book_id, quantity)
    VALUES ?`;
  values = [];
  orderItems.forEach(item => {
    values.push([orderId, item.book_id, item.quantity]);
  });
  result = await conn.query(sql, [values]);

  result = await deleteCartItems(conn, items);

  return res.status(StatusCodes.OK).json(result);
};

const deleteCartItems = async (conn, items) => {
  let sql = `DELETE FROM cartItems WHERE id IN (?)`;
  let values = items;

  return await conn.query(sql, [values]);
};

const getOrders = async (req, res) => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'bookShop',
    dateStrings: true,
  });

  const authorization = ensureAuthorization(req);

  if (authorization instanceof jwt.TokenExpiredError) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: '로그인 세션이 만료되었습니다. 다시 로그인 하세요',
    });
  } else if (authorization instanceof jwt.JsonWebTokenError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: '잘못된 토큰입니다.',
    });
  } else if (authorization instanceof ReferenceError) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: '로그인을 해주세요',
    });
  }

  let sql = `SELECT orders.id, created_at, address, receiver, 
    contact, book_title, total_quantity, total_price
    FROM orders LEFT JOIN delivery
    ON orders.delivery_id = delivery.id
    WHERE user_id = ?`;
  let values = [authorization.id];
  let [rows, field] = await conn.query(sql, values);

  rows.map(row => {
    row.createdAt = row.created_at;
    row.bookTitle = row.book_title;
    row.totalQuantity = row.total_quantity;
    row.totalPrice = row.total_price;

    delete row.created_at;
    delete row.book_title;
    delete row.total_quantity;
    delete row.total_price;
  });

  return res.status(StatusCodes.OK).json(rows);
};

const getOrderDetail = async (req, res) => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'bookShop',
    dateStrings: true,
  });

  const { id: orderId } = req.params;

  const authorization = ensureAuthorization(req);

  if (authorization instanceof jwt.TokenExpiredError) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: '로그인 세션이 만료되었습니다. 다시 로그인 하세요',
    });
  } else if (authorization instanceof jwt.JsonWebTokenError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: '잘못된 토큰입니다.',
    });
  } else if (authorization instanceof ReferenceError) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: '로그인을 해주세요',
    });
  }

  let sql = `SELECT book_id, title, author, price, quantity
    FROM orderedBook LEFT JOIN books
    ON orderedBook.book_id = books.id
    WHERE order_id = ?`;
  let values = [orderId];
  let [rows, fields] = await conn.query(sql, values);

  rows.map(row => {
    row.bookId = row.book_id;

    delete row.book_id;
  });

  return res.status(StatusCodes.OK).json(rows);
};

module.exports = {
  order,
  getOrders,
  getOrderDetail,
};
