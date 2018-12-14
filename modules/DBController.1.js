var mysql = require("promise-mysql");
const pool = require('./pool');
const usersDB = require('./usersDB')
const vacationsDB = require('./vacationsDB');

const firstConnection = mysql.createPool({
  port: 3306,
  host: "localhost",
  user: "root",
  password: "root"
});
const adminUser = {
  userName: 'Admin',
  firstName: 'Admin',
  lastName: 'Admin',
  password: 'Admin',
  isAdmin: true
}

module.exports = {
  createDB() {
    const dbCMD = `CREATE SCHEMA IF NOT EXISTS vacations`;
    const usersCMD = `CREATE TABLE IF NOT EXISTS users (
            id INT NOT NULL AUTO_INCREMENT,
            userName VARCHAR(500) NOT NULL,
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
    firstConnection.creatreConnection().query(dbCMD)
      .then(pool.query(vacationsCMD)).then((results) => {
        if (results.warningCount === 0) return pool.query(usersCMD)
      }).then(results => {
        if (results.warningCount === 0) this.addUser(adminUser)
      });
  },
  addUser: function (user) {
    return usersDB.addUser(user);
  },
  addVacation: vacation => {
    return vacationsDB.addVacation(vacation);
  },
  editVacation: (id, vacation) => {
    return vacationsDB.editVacation(id, vacation);
  },
  deleteVacation: id => {
    return vacationsDB.deleteVacation(id);
  },
  login: user => {
    return usersDB.login(user);
  },
  loginAdmin: admin => {
    return usersDB.loginAdmin(admin);
  },
  updateUsersList: function () {
    usersDB.updateUsersList();
  },
  checkUsername: function (username) {
    return usersDB.checkUsername(username);
  },
  follow: (token, vacationID) => {
    return usersDB.follow(token, vacationID);
  },
  checkIfAdmin: (token) => {
    return usersDB.checkIfAdmin(token);
  }
};