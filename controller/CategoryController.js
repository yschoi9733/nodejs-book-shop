const conn = require('../mariadb');
const { StatusCodes } = require('http-status-codes');

const allCategory = (req, res) => {
  let sql = `SELECT * FROM category`;
  conn.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    result.map(category => {
      category.id = category.category_id;
      category.name = category.category_name;

      delete category.category_id;
      delete category.category_name;
    });

    return res.status(StatusCodes.OK).json(result);
  });
};

module.exports = {
  allCategory,
};
