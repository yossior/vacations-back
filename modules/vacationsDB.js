const pool = require('./pool');
const usersDB = require('./usersDB')
module.exports = {
    addVacation: vacation => {
        const insertCMD = `INSERT INTO vacations (description, location, picture, price, startDate, endDate) VALUES (
          '${vacation.description}','${vacation.location}','${vacation.picture}',${
          vacation.price
        },'${vacation.startDate}','${vacation.endDate}')`;
        return new Promise((resolve, reject) => {
            pool
                .query(insertCMD)
                .then(resolve())
                .catch(err => reject(err));
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
        const insertCMD = `DELETE FROM vacations WHERE id = ${id}`;
        return new Promise((resolve, reject) => {
            pool
                .query(insertCMD)
                .then(resolve())
                .catch(err => reject(err));
        });
    }
}