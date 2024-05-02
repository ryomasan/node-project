const router = require("express").Router();
const { body } = require("express-validator");
const { index, register, login, resetPassword, forgotPassword } = require("../controllers/authController");

router.get("/index", index);

router.post(
  "/register",
  body("email").notEmpty().isEmail().escape(),
  body("password").notEmpty().isLength({ min: 9, max: 20 }).escape(),
  body("password_confirmation")
    .notEmpty()
    .withMessage("確認用パスワードを入力してください")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("パスワードが一致していません");
      }
      return true;
    })
    .escape(), register
);

router.post("/login", login);

router.post("/forgot-password", forgotPassword);

router.post(
  "/reset-password",
  body("password").notEmpty().isLength({ min: 9, max: 20 }).escape(),
  body("password_confirmation")
    .notEmpty()
    .withMessage("確認用パスワードを入力してください")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("パスワードが一致していません");
      }
      return true;
    })
    .escape(),resetPassword);

module.exports = router;
