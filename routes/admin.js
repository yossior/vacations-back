var express = require("express");
var router = express.Router();
const db = require("../modules/DBController");
const io = require('socket.io')();
io.listen(3008);

async function emitVacs() {
  io.emit('VACS_UPDATE', await db.getAllVacations())
}

router.get("/",async function (req, res, next) {
  res.send(await db.getAllVacations());
});

router.post("/", async function (req, res, next) {
  console.log("gooooooooooooooooooooo");
  const token = await db.addVacation(req.body.edited);
  res.cookie("token", token);
  emitVacs();
  res.send();
});

router.put("/:id", async function (req, res, next) {
  console.log('puuuuuuuuuuuuuuuuuuuuuuuuuuuuuut');
  // const response = await db.editVacation(req.params.id, req.body.edited);
  res.send(await db.editVacation(req.params.id, req.body.edited));
  emitVacs();
});

router.delete("/:id", async function (req, res, next) {
  res.send(await db.deleteVacation(req.params.id));
  emitVacs();
});

module.exports = router;