var mysql = require("promise-mysql");
module.exports = mysql.createPool({
    database: "vacations",
    port: 3306,
    host: "localhost",
    user: "root",
    password: "root"
  });