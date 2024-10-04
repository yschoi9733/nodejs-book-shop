const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'Youtube',
  dateStrings: true,
});

// A simple SELECT query
connection.query(
  'SELECT * FROM `users`',
  function (err, results, fields) {
    let {id, email, name, created_at} = results[0];
    console.log(created_at);
  }
);