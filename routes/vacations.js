var express = require("express");
var router = express.Router();
const db = require("../modules/DBController");

router.get("/",async function (req, res, next) {
  res.send(await db.getAllVacations());
});
router.get("/following",async function (req, res, next) {
  res.send(await db.getVacationsFollowing(req.cookies.userID));
});

module.exports = router;