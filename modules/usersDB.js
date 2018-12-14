let usersList = require("../models/usersList");
const vacationsDB = require('./vacationsDB');
const uniqueString = require("unique-string");
const bcrypt = require("bcrypt");
const saltRounds = 10;

module.exports = {
    addUser: function (user) {
        return new Promise((resolve, reject) => {
            const unique = uniqueString();
            bcrypt
                .hash(user.password, saltRounds)
                .then(hash => {
                    const insertCMD = `INSERT INTO users (userName, firstName, lastName, password, token, isAdmin) VALUES ('${
            user.userName
          }','${user.firstName}','${user.lastName}','${hash}', '${unique}', ${user.isAdmin ? "b'1'" : "b'0'"})`;
                    return pool.query(insertCMD);
                })
                .then(resolve(unique))
                .then(this.updateUsersList())
                .catch(err => reject(err));
        });
    },
    login: user => {
        return new Promise((resolve, reject) => {
          const getPassCMD = `SELECT password, token FROM users WHERE userName = '${
            user.userName
          }'`;
          pool.query(getPassCMD).then(results => {
            if (results.length > 0)
              bcrypt.compare(user.password, results[0].password, (err, same) => {
                if (err) throw err;
                same ? resolve(results[0].token) : reject("bad");
              });
            else reject("bad");
          });
        });
      },
      loginAdmin: admin => {
        return new Promise((resolve, reject) => {
          const getPassCMD = `SELECT password, isAdmin, token FROM users WHERE userName = '${
            admin.userName
          }'`;
          pool.query(getPassCMD).then(results =>
            bcrypt.compare(admin.password, results[0].password, (err, same) => {
              if (err) throw err;
              if (same)
                if (results[0].isAdmin === 1) resolve(results[0].token);
                else reject("bad");
              else reject("bad");
            })
          );
        });
      },
      updateUsersList: function () {
        const getPassCMD = `SELECT userName FROM users`;
        pool.query(getPassCMD).then(results => {
          usersList = [];
          for (user of results) {
            usersList.push(user.userName);
          }
        });
      },
      checkUsername: function (username) {
        return usersList.includes(username);
      },
      follow: (token, vacationID) => {
        if (typeof token !== "undefined" || token === 'undefined') {
          const updateFollowCMD = `UPDATE users set follows = TRIM(LEADING ',' FROM CONCAT(follows, ',${vacationID}')) WHERE token = '${token}'`;
          const updateVacationCMD = `UPDATE vacations set followers = followers + 1 WHERE id = ${vacationID}`
          pool.query(updateFollowCMD).then(pool.query(updateVacationCMD));
        }
      },
      checkIfAdmin: (token) => {
        if (typeof token !== 'undefined') {
          const checkCMD = `SELECT isAdmin FROM users WHERE token = ${token}`;
          pool.query(checkCMD)
            .then(results => results[0].isAdmin === 1);
        }
      }
}