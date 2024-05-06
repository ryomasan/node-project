const router = require("express").Router();
const { body } = require("express-validator");
const {
  index,
  register,
  login,
  resetPassword,
  forgotPassword,
  logout
} = require("../controllers/authController");

// router.get("/", (req, res) => {
//   if (req.session.authenticated) {
//     res.redirect("/posts");
//   } else {
//     // ユーザーが未認証の場合、ログインページにリダイレクト
//     res.redirect("/login");
//   }
// });

router.post(
  "/register",
  body("email")
    .notEmpty()
    .withMessage("メールアドレスを入力してください")
    .isEmail()
    .withMessage("メールアドレスの形式で入力してください")
    .escape(),
  body("password")
    .notEmpty()
    .withMessage("パスワードを入力してください")
    .isLength({ min: 9, max: 20 })
    .withMessage("パスワードは9文字以上20文字以内で入力してください")
    .escape(),
  body("password_confirmation")
    .notEmpty()
    .withMessage("確認用パスワードを入力してください")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("パスワードが一致していません");
      }
      return true;
    })
    .escape(),
  body("user_type").notEmpty().withMessage("ユーザータイプを指定してください"),
  register
);

router.post(
  "/login",
  body("email")
    .notEmpty()
    .withMessage("メールアドレスを入力してください")
    .custom((value, { req }) => {
      if (value !== req.body.email) {
        throw new Error("メールアドレスが一致していません");
      }
      return true;
    })
    .escape(),
  body("password")
    .notEmpty()
    .withMessage("パスワードを入力してください")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("パスワードが一致していません");
      }
      return true;
    })
    .escape(),
  login
);

router.post("/forgot-password", forgotPassword);

router.post(
  "/reset-password",
  body("password")
    .notEmpty()
    .withMessage("確認用パスワードを入力してください")
    .isLength({ min: 9, max: 20 })
    .withMessage("パスワードは9文字以上20文字以内で入力してください")
    .escape(),
  body("password_confirmation")
    .notEmpty()
    .withMessage("確認用パスワードを入力してください")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("パスワードが一致していません");
      }
      return true;
    })
    .escape(),
  resetPassword
);

router.get('/logout', logout);

module.exports = router;
