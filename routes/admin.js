var express = require("express");
var router = express.Router();
const db = require("../modules/DBController");

router.get("/",async function (req, res, next) {
  res.send(await db.getAllVacations());
});

router.post("/", async function (req, res, next) {
  const token = await db.addVacation(req.body);
  res.cookie("token", token);
  res.send();
});

router.put("/:id", async function (req, res, next) {
  res.send(await db.editVacation(req.params.id, req.body));
});

router.delete("/:id", async function (req, res, next) {
  res.send(await db.deleteVacation(req.params.id));
});

module.exports = router;