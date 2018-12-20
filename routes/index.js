var express = require('express');
var router = express.Router();
const db = require('../modules/DBController');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/login', async function (req, res, next) {
  const results = await db.login(req.body).catch(err => err);
  res.cookie('token', results.token);
  res.cookie('userID', results.id);
  res.send({});
});

router.post('/follow/:vacID', async function (req, res, next) {
  await db.follow(req.cookies.token, req.cookies.userID, req.params.vacID);
  res.send('OK!');
});

router.post('/unfollow/:vacID', async function (req, res, next) {
  await db.unfollow(req.params.userID, req.params.vacID);
  res.send('OK!');
});

module.exports = router;
