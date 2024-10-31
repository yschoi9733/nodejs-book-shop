const conn = require('../mariadb');
const {StatusCodes} = require('http-status-codes');
const jwt = require('jsonwebtoken');
const ensureAuthorization = require('../auth');

const allBooks = (req, res) => {
  let allBooksRes = {};
  let {categoryId, news, limit, currentPage} = req.query;

  let sql = `SELECT SQL_CALC_FOUND_ROWS *, 
    (SELECT count(*) FROM likes WHERE liked_book_id = books.id) AS likes 
    FROM books `;
  let values = [];
  if (categoryId && news) {
    sql += `WHERE category_id=? AND pub_date 
      BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()`;
    values.push(categoryId);
  } else if (categoryId) {
    sql += `WHERE category_id=?`;
    values.push(categoryId);
  } else if (news) {
    sql += `WHERE pub_date 
      BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()`;
  }

  let offset;
  if (limit && currentPage){
    offset = limit*(currentPage - 1);
    sql += ` LIMIT ? OFFSET ?`;
    values.push(+limit, offset);
  }

  conn.query(sql, values, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    if (results.length){
      results.map((result) => {
        result.pubDate = result.pub_date;
        delete result.pub_date;
      })
      allBooksRes.books = results;
    } else {
      return res.status(StatusCodes.NOT_FOUND).end();
    }
  })

  sql = `SELECT found_rows()`;
  conn.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }
    let pagination = {};
    pagination.currentPage = parseInt(currentPage);
    pagination.totalCount = result[0]['found_rows()'];

    allBooksRes.pagination = pagination;

    return res.status(StatusCodes.OK).json(allBooksRes);
  })
}

const bookDetail = (req, res) => {
  let {id: bookId} = req.params;
  let sql;
  let values;
  
  const authorization = ensureAuthorization(req);

  if (authorization instanceof jwt.TokenExpiredError){
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "로그인 세션이 만료되었습니다. 다시 로그인 하세요",
    });
  } else if (authorization instanceof jwt.JsonWebTokenError){
    return res.status(StatusCodes.BAD_REQUEST).json({
      "message": "잘못된 토큰입니다.",
    })
  } else if (authorization instanceof ReferenceError){
    sql = `SELECT *, 
      (SELECT count(*) FROM likes WHERE liked_book_id = books.id) AS likes
      FROM books LEFT JOIN category ON books.category_id = category.category_id 
      WHERE books.id=?`;
    values = [bookId];
  } else {
    sql = `SELECT *, 
      (SELECT count(*) FROM likes WHERE liked_book_id = books.id) AS likes, 
      (SELECT EXISTS (SELECT * FROM likes WHERE user_id=? AND liked_book_id=?)) AS liked 
      FROM books LEFT JOIN category ON books.category_id = category.category_id 
      WHERE books.id=?`;
    values = [authorization.id, bookId, bookId];
  }

  conn.query(sql, values, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    if (result[0]){
      return res.status(StatusCodes.OK).json(result[0]);
    } else {
      return res.status(StatusCodes.NOT_FOUND).end();
    }
  })
}

module.exports = {
  allBooks,
  bookDetail,
}