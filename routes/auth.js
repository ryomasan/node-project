const router = require("express").Router();
const {
  query,
  validationResult,
  matchedData,
  body,
} = require("express-validator");
const { User } = require("../db/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config");
const nodeMailer = require("nodemailer");

router.get("/", (req, res) => {
  res.send("Hello Authjs");
  console.log(res);
});

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
    .escape(),
  async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const password_confirmation = req.body.password_confirmation;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(400).json({ errors: errors.array() });
    } else {
      console.log(email, password, password_confirmation);
    }

    const user = User.find((user) => user.email === email);
    if (user) {
      return res.status(400).json([
        {
          message: "すでにそのユーザーは存在しています",
        },
      ]);
    } 
    
    let hasedPassword = await bcrypt.hash(password, 10);
    const payload = {
        email: email,
        password: hasedPassword,
    };
    
    User.push(payload);
    

    // let hasedPassword = await bcrypt.hash(password, 10)
    // const payload = {
    //     email:email,
    //     password: hasedPassword,
    // }

    // User.push(payload);

    const token = jwt.sign(payload, config.jwt.secret, config.jwt.options);
    console.log(token);
    if (token) {
      return res.json({
        token: token,
      });
    }
  }
);

router.get("/index", (req, res) => {
  return res.json(User);
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = User.find(
    (user) => user.email === email && user.password === password
  );
  if (user) {
    return res.status(400).json([
        {
          message: "ログインしました",
        },
    ]);
  }
  else{
    return res.status(400).json([
        {
          message: "メールアドレスまたはパスワードが一致しません",
        },
    ]);
  }
});

router.post("/reset-password", 
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
  .escape(), async (res, req)=>{
    const password = req.body.password;
    const password_confirmation = req.body.password_confirmation;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(400).json({ errors: errors.array() });
    } else {
      console.log(password, password_confirmation);
    }    
    let hasedPassword = await bcrypt.hash(password, 10);
    const payload = {
        password: hasedPassword,
    };
    
    User.push(payload);
    const token = jwt.sign(payload, config.jwt.secret, config.jwt.options);
    if (token) {
      return res.json({
        token: token,
      });
    }
})

function generateRandom5DigitNumber() {
    let randomNumber = Math.floor(Math.random() * 100000);
    // 数字が5桁になるまで0を付加する
    randomNumber = String(randomNumber).padStart(5, '0');
    return randomNumber;
  }
  const random5DigitNumber = generateRandom5DigitNumber();
  console.log(random5DigitNumber);

module.exports = router;
