var express = require('express');
var router = express.Router();
const db = require('../modules/DBController');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/login', async function (req, res, next) {
  const token = await db.login(req.body).catch(err => err);
  res.cookie('token', token);
  res.send({});
});

router.post('/admin', async function (req, res, next) {
  const token = await db.login(req.body).catch(err => err);
  res.cookie('token', token);
  res.send(token);
});

router.post('/follow', async function (req, res, next) {
  await db.follow(req.cookies.token, req.body.vacationArr);
  res.send('OK!');
});

module.exports = router;
