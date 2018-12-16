var express = require("express");
var router = express.Router();
const db = require("../modules/DBController");

router.get("/",async function (req, res, next) {
  res.send(await db.getAllVacations());
});

module.exports = router;