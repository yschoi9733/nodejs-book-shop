const conn = require('../mariadb');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config();

const join = (req, res) => {
  const { email, password } = req.body;

  const salt = crypto.randomBytes(10).toString('base64');
  const hashPassword = crypto
    .pbkdf2Sync(password, salt, 10000, 10, 'sha512')
    .toString('base64');

  let sql = `INSERT INTO users (email, password, salt) VALUES (?, ?, ?)`;
  let values = [email, hashPassword, salt];
  conn.query(sql, values, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    if (result.affectedRows) {
      return res.status(StatusCodes.CREATED).json(result);
    } else {
      return res.status(StatusCodes.BAD_REQUEST).end();
    }
  });
};

const login = (req, res) => {
  const { email, password } = req.body;

  let sql = `SELECT * FROM users WHERE email = ?`;
  let values = email;
  conn.query(sql, values, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    const loginUser = result[0];

    const hashPassword = crypto
      .pbkdf2Sync(password, loginUser.salt, 10000, 10, 'sha512')
      .toString('base64');

    if (loginUser && loginUser.password === hashPassword) {
      const token = jwt.sign(
        {
          id: loginUser.id,
          email: loginUser.email,
        },
        process.env.PRIVATE_KEY,
        {
          expiresIn: '10m',
          issuer: 'yuseong',
        },
      );

      res.cookie('token', token, {
        httpOnly: true,
      });

      return res.status(StatusCodes.OK).json({ token: token });
    } else {
      return res.status(StatusCodes.UNAUTHORIZED).end();
    }
  });
};

const passwordResetRequest = (req, res) => {
  const { email } = req.body;

  let sql = `SELECT * FROM users WHERE email = ?`;
  let values = email;
  conn.query(sql, values, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    // 이메일로 유저가 있는지 찾아봅니다!
    const user = result[0];
    if (user) {
      return res.status(StatusCodes.OK).json({
        email,
      });
    } else {
      return res.status(StatusCodes.UNAUTHORIZED).end();
    }
  });
};

const passwordReset = (req, res) => {
  const { email, password } = req.body;

  const salt = crypto.randomBytes(10).toString('base64');
  const hashPassword = crypto
    .pbkdf2Sync(password, salt, 10000, 10, 'sha512')
    .toString('base64');

  let sql = `UPDATE users SET password = ?, salt = ? WHERE email = ?`;
  let values = [hashPassword, salt, email];
  conn.query(sql, values, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    if (result.affectedRows) {
      return res.status(StatusCodes.OK).json(result);
    } else {
      return res.status(StatusCodes.BAD_REQUEST).end();
    }
  });
};

module.exports = {
  join,
  login,
  passwordResetRequest,
  passwordReset,
};
