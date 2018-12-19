var mysql = require("promise-mysql");
const uniqueString = require("unique-string");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const pool = require('./pool');
const fs = require('fs');
let usersList = require("../models/usersList");
const firstConnection = mysql.createConnection({
  port: 3306,
  host: "localhost",
  user: "root",
  password: "root"
});

const adminUser = {
  user: 'Admin',
  firstName: 'Admin',
  lastName: 'Admin',
  password: 'Admin',
  isAdmin: true
};

const io = require('socket.io')();
async function emitVacs() {
  io.emit('VACS_UPDATE', await db.getAllVacations())
};


module.exports = {
  createDB() {
    const dbCMD = `CREATE SCHEMA IF NOT EXISTS vacations`;
    const usersCMD = `CREATE TABLE IF NOT EXISTS users (
            id INT NOT NULL AUTO_INCREMENT,
            username VARCHAR(500) NOT NULL,
            firstName VARCHAR(500) NOT NULL,
            lastName VARCHAR(500) NOT NULL,
            password VARCHAR(500) NOT NULL,
            follows VARCHAR(500) NULL NOT NULL DEFAULT '',
            token VARCHAR(500) NULL,
            isAdmin BIT(1) NOT NULL DEFAULT 0,
            PRIMARY KEY (id))`;
    const vacationsCMD = `CREATE TABLE IF NOT EXISTS vacations (
                id INT NOT NULL AUTO_INCREMENT,
                description VARCHAR(500) NULL,
                location VARCHAR(500) NULL,
                picture VARCHAR(500) NULL,
                price INT NULL,
                startDate DATE NULL,
                endDate DATE NULL,
                followers INT NOT NULL DEFAULT 0,
                PRIMARY KEY (id))`;
    const followers = `CREATE TABLE IF NOT EXISTS followers (
                  id INT NOT NULL AUTO_INCREMENT,
                  vacationID INT NOT NULL,
                  userID INT NOT NULL,
                  PRIMARY KEY (id));
                `;
    firstConnection.then(conn => conn.query(dbCMD))
      .then(results => {
        if (typeof results !== 'undefined' && results.warningCount === 0) return pool.query(vacationsCMD)
      })
      .then(results => {
        if (typeof results !== 'undefined' && results.warningCount === 0) return pool.query(followers)
      })
      .then(results => {
        if (typeof results !== 'undefined' && results.warningCount === 0) return pool.query(usersCMD)
      })
      .then(results => {
        if (typeof results !== 'undefined' && results.warningCount === 0) this.addUser(adminUser)
      });
  },
  addUser: function (user) {
    return new Promise((resolve, reject) => {
      const unique = uniqueString();
      bcrypt.hash(user.password, saltRounds)
        .then(hash => {
          const insertCMD = `INSERT INTO users (username, firstName, lastName, password, token, isAdmin) VALUES ('${
            user.username
            }','${user.firstName}','${user.lastName}','${hash}', '${unique}', ${user.isAdmin ? "b'1'" : "b'0'"})`;
          return pool.query(insertCMD);
        })
        .then(() => {
            this.login(user).then(results => resolve(results));
        })
        .then(this.updateUsersList())
        .catch(err => console.log(err));
    });
  },
  addVacation: vacation => {
    const picName = uniqueString();
    // fs.appendFile(new Image().src = vacation.picture)
    const insertCMD = `INSERT INTO vacations (description, location, picture, price, startDate, endDate) VALUES (
      '${vacation.description}','${vacation.location}','${vacation.picture}',${
      vacation.price
      },'${vacation.startDate}','${vacation.endDate}')`;
    return new Promise((resolve, reject) => {
      pool
        .query(insertCMD)
        .then((results) => {
          console.log(results);
          resolve(results)
        })
        .catch(err => console.log(err));
    });
  },
  editVacation: (id, vacation) => {
    const editCMD = `UPDATE vacations SET description = '${
      vacation.description
      }', location = '${vacation.location}', picture = '${
      vacation.picture
      }', price = '${vacation.price}', startDate = '${
      vacation.startDate
      }', endDate = '${vacation.endDate}' WHERE id = ${id}`;
    return new Promise((resolve, reject) => {
      pool
        .query(editCMD)
        .then(results => resolve(results))
        .catch(err => reject(err));
    });
  },
  deleteVacation: id => {
    const deleteCMD = `DELETE FROM vacations WHERE id = ${id}`;
    return new Promise((resolve, reject) => {
      pool
        .query(deleteCMD)
        .then(results => {
          resolve(results);
          // emitVacs();
        })
        .catch(err => reject(err));
    });
  },
  login: user => {
    return new Promise((resolve, reject) => {
      const getPassCMD = `SELECT password, id,  token FROM users WHERE username = '${
        user.username
        }'`;
      pool.query(getPassCMD).then(results => {
        if (results.length > 0)
          bcrypt.compare(user.password, results[0].password, (err, same) => {
            if (err) throw err;
            same ? resolve(results[0]) : reject("bad1");
          });
        else reject("bad2");
      });
    });
  },
  loginAdmin: admin => {
    return new Promise((resolve, reject) => {
      const getPassCMD = `SELECT password, isAdmin, token FROM users WHERE username = '${
        admin.user
        }'`;
      pool.query(getPassCMD).then(results =>
        bcrypt.compare(admin.password, results[0].password, (err, same) => {
          if (err) throw err;
          if (same)
            if (results[0].isAdmin === 1) resolve(results[0].token);
            else reject("bad3");
          else reject("bad4");
        })
      );
    });
  },
  updateUsersList: function () {
    const getPassCMD = `SELECT username FROM users`;
    pool.query(getPassCMD).then(results => {
      usersList = [];
      for (user of results) {
        usersList.push(user.user);
      }
    });
  },
  checkUsername: function (username) {
    return usersList.includes(username);
  },
  follow: (token, userID, vacationID) => {
    return new Promise((resolve, reject) => {
      if (typeof token !== "undefined" || token === 'undefined') {
        const updatefollowersCMD = `INSERT INTO followers(vacationID, userID) VALUES(${vacationID}, ${userID})`;
        pool.query(updatefollowersCMD).then(res => {
          resolve(res)
        });
      }
    })
  },
  checkIfAdmin: (token) => {
    if (typeof token !== 'undefined') {
      const checkCMD = `SELECT isAdmin FROM users WHERE token = ${token}`;
      pool.query(checkCMD)
        .then(results => results[0].isAdmin === 1);
    }
  },
  getUser: token => {
    const getCMD = `SELECT firstName, lastName, username FROM users WHERE token = '${token}'`
    return pool.query(getCMD)
  },
  getAllVacations: () => {
    const getCMD = `SELECT * FROM vacations`;
    return pool.query(getCMD);
  },
  getVacationsFollowing: id => {
    const sql=`SELECT v.*, NOT ISNULL(f.userid) AS follows FROM vacations v
         LEFT JOIN  followers f ON v.id=f.vacationid AND f.userid= ? `;
    return pool.query(getCMD);
  }
};