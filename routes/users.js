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
  const token = await db.addUser(req.body);
  res.cookie('token', token);
  res.send();
});

router.post('/check', async function (req, res, next) {
  res.send(await db.checkUsername(req.body.userName));
});



module.exports = router;