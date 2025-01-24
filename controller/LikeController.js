const conn = require('../mariadb');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const ensureAuthorization = require('../auth');

const addLike = (req, res) => {
  const { id: likedBookId } = req.params;
  const authorization = ensureAuthorization(req);
  console.log(req.headers);

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

  let sql = `INSERT INTO likes (user_id, liked_book_id) VALUES (?, ?)`;
  let values = [authorization.id, likedBookId];
  conn.query(sql, values, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    return res.status(StatusCodes.OK).json(result);
  });
};

const removeLike = (req, res) => {
  const { id: likedBookId } = req.params;
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

  let sql = `DELETE FROM likes WHERE user_id = ? AND liked_book_id = ?`;
  let values = [authorization.id, likedBookId];
  conn.query(sql, values, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    return res.status(StatusCodes.OK).json(result);
  });
};

module.exports = {
  addLike,
  removeLike,
};
