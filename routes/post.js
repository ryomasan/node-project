const router = require("express").Router();
// const { body } = require("express-validator");
const { index } = require("../controllers/postController");

router.get("/", index);

module.exports = router;
