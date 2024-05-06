const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const config = require("../config");
const { validationResult, body } = require("express-validator");

async function index(req, res) {
  const { connection } = require("../server");
  try {
    const results = await new Promise((resolve, reject) => {
      connection.query("SELECT * FROM `users`", (error, results) => {
        if (error) {
          console.log("Error fetching users: ", error);
          reject("ユーザーの取得に失敗しました");
        } else {
          console.log("Fetched users: ", results);
          resolve(results);
        }
      });
    });
    return res.status(200).json(results);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "ユーザーの取得に失敗しました" });
  }
}

const transporter = nodemailer.createTransport({
  ignoreTLS: true,
  port: 1025,
  secure: false,
});

async function register(req, res) {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const user_type = req.body.user_type;
  // const password_confirmation = req.body.password_confirmation;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { connection } = require("../server");
    connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (error, results) => {
        if (error) {
          console.error(error);
          return res
            .status(500)
            .json({ message: "サーバーエラーが発生しました" });
        }

        if (results.length > 0) {
          // ユーザーが既に存在する場合
          return res
            .status(400)
            .json([{ message: "すでにそのユーザーは存在しています" }]);
        } else {
          let hashedPassword = await bcrypt.hash(password, 10);

          const sql =
            "INSERT INTO users (name, email, password, user_type) VALUES (?, ?, ?, ?)";
          connection.query(
            sql,
            [name, email, hashedPassword, user_type],
            async (error, results) => {
              if (error) {
                console.error(error);
                return res
                  .status(500)
                  .json({ message: "サーバーエラーが発生しました" });
              }
              const insertedUserId = results.insertId;
              const payload = {
                name: name,
                email: email,
                password: hashedPassword,
              };
              const token = jwt.sign(
                payload,
                config.jwt.secret,
                config.jwt.options
              );
              if (token) {
                const authenticationCodeUrl = `http://${req.headers.host}/auth/authentication-code/${insertedUserId}/${token}`;
                const redirectUrl =
                  "http://localhost:3000/auth/completion-user-registration";
                const mailOptions = {
                  from: "ryo1030ma2@gmail.com",
                  to: email,
                  subject: "ユーザー登録完了",
                  html: `
                        <p>以下のURLをクリックして、ユーザー登録を完了してください<\p>
                        <a href="${redirectUrl}">${authenticationCodeUrl}<\a>
                        `,
                };
                await transporter.sendMail(mailOptions, (error, info) => {
                  if (error) {
                    console.error(error);
                    return res.status(500).json({
                      message: "メールの送信中にエラーが発生しました",
                    });
                  }
                  return res.status(200).json({
                    message: "登録が成功しました",
                    token: token,
                    redirectUrl: redirectUrl,
                  });
                });
              }
            }
          );
        }
      }
    );
  } catch (error) {
    return res.status(500).json({ error });
  }
}

async function login(req, res) {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);

  try {
    const { connection } = require("../server");
    const sql = "SELECT * FROM users WHERE email = ?";
    connection.query(sql, [email], async (error, results) => {
      if (error) {
        console.error(error);
        return res
          .status(500)
          .json({ message: "サーバーエラーが発生しました" });
      }

      if (results.length == 0) {
        return res.status(400).json([
          {
            message: "ユーザーが見つかりません",
          },
        ]);
      }

      const user = results[0];
      const matchedUser = await bcrypt.compare(password, user.password);
      if (!matchedUser) {
        return res.status(400).json([
          {
            message: "メールアドレスまたはパスワードが一致しません",
          },
        ]);
      }

      const payload = {
        userId: user.id,
        email: email,
      };

      const token = jwt.sign(payload, config.jwt.secret, config.jwt.options);

      if (token) {
        req.session.authenticated = true;
        return res.status(200).json({
          token: token,
          message: "ログインに成功しました",
        });
      }
    });
  } catch (error) {
    return res.status(500).json({ error });
  }
}

async function forgotPassword(req, res) {
  try {
    const users = await index(req, res);
    const email = req.body.email;
    const user = users.find((user) => user.email === email);
    if (!user) {
      return res.status(404).json({ error: "ユーザーが見つかりません" });
    } else {
      const resetUrl = `http://${req.headers.host}/auth/reset-password?email=${email}`;
      console.log(resetUrl);
      const mailOptions = {
        from: "ryo1030ma2@gmail.com",
        to: email,
        subject: "パスワードリセットリクエスト",
        html: `
        <p>パスワードリセットをリクエストしました。以下のリンクをクリックしてパスワードをリセットしてください。<\p>
        <a href="${resetUrl}">${resetUrl}<\a>
        <p>このリクエストを行っていない場合は、このメールを無視してください。<\p>
        `,
      };
      await transporter.sendMail(mailOptions);
      res.json({ message: "パスワードリセットメールが送信されました" });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ error: "パスワードリセットメールの送信に失敗しました" });
  }
}

async function resetPassword(req, res) {
  // パスワードリセットトークンを検証する
  const token = req.query.token;
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  const users = await index(req, res);
  // IDとトークンでユーザーを検索し、トークンがまだ有効かどうかを確認する
  const user = await users.findOne({
    _id: decodedToken.id,
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res
      .status(401)
      .json({ error: "無効または期限切れのパスワードリセットトークン" });
  }

  // ユーザーのパスワードを更新し、リセットトークンとその有効期限を削除する
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 確認メールを送信する
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "パスワードリセット確認",
    html: `
        <p>パスワードが正常にリセットされました。</p>
      `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: "パスワードリセットが成功しました" });
  } catch (err) {
    console.error("パスワードリセット確認メールの送信に失敗しました：", err);
    res
      .status(500)
      .json({ error: "パスワードリセット確認メールの送信に失敗しました" });
  }
}

async function logout(req, res) {
  try {
    req.session.destroy();
    res.status(200).json({
      message: "ログインに成功しました",
    });
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  index,
  register,
  login,
  forgotPassword,
  resetPassword,
  logout,
};
