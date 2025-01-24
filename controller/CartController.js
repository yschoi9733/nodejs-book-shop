const conn = require('../mariadb');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const ensureAuthorization = require('../auth');

const addCartItem = (req, res) => {
  const { bookId, quantity } = req.body;
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

  let sql = `INSERT INTO cartItems (book_id, quantity, user_id) VALUES (?, ?, ?)`;
  let values = [bookId, quantity, authorization.id];
  conn.query(sql, values, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    return res.status(StatusCodes.OK).json(result);
  });
};

const getCartItems = (req, res) => {
  const { selected } = req.body;
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

  let sql = `SELECT cartItems.id, book_id, title, summary, quantity, price 
  FROM cartItems LEFT JOIN books 
  ON cartItems.book_id = books.id
  WHERE user_id = ?`;
  let values = [authorization.id];
  if (selected) {
    sql += ` AND cartItems.id IN (?)`;
    values.push(selected);
  }

  conn.query(sql, values, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    return res.status(StatusCodes.OK).json(result);
  });
};

const removeCartItem = (req, res) => {
  const { id: cartItemId } = req.params;

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

  let sql = `DELETE FROM cartItems WHERE id = ?`;
  let values = [cartItemId];
  conn.query(sql, values, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    return res.status(StatusCodes.OK).json(result);
  });
};

module.exports = {
  addCartItem,
  getCartItems,
  removeCartItem,
};
