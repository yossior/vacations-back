var express = require('express');
var router = express.Router();
const db = require('../modules/DBController');

/* GET users listing. */
router.get('/', async function (req, res, next) {
  if (typeof req.cookies.token !== 'undefined')
    res.send(await db.getUser(req.cookies.token).then(results => results))
  else res.status(401).send("Not Found");
});

router.post('/', async function (req, res, next) {
  const results = await db.addUser(req.body);
  res.cookie('token', results.token);
  res.cookie('userID', results.id);
  res.send();
});

router.get('/check/:username', async function (req, res, next) {
  res.status(db.checkUsername(req.params.username) ? 409 : 200).send();
});
module.exports = router;