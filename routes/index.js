var express = require("express");
var router = express.Router();
const auth = require('../config/auth');

/* GET home page. */
router.get("/", auth.ensureAuthenticated, function (req, res, next) {
  res.render("./default/index", { title: "Trang chính" });
});

module.exports = router;
