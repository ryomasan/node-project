const express = require("express");
const mysql = require("mysql");
const app = express();
const cors = require("cors");
const WEB_SERVER_PORT = 8000; // Webサーバーのポート番号
const DB_PORT = 3306;
const auth = require("./routes/auth");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const MySQLStore = require("express-mysql-session")(session);

const crypto = require("crypto");
const uuid = require("node-uuid");

app.use(express.json());

app.use("/auth", auth);

const mysqlOptions = {
  host: "localhost",
  user: "root",
  password: "",
  port: DB_PORT,
  database: "tt_diary",
};

app.use(cors());
app.use(cookieParser());

const connection = mysql.createPool(mysqlOptions);

// connection.getConnection((err, conn) => {
//   if (err) {
//     if (err.code === "PROTOCOL_CONNECTION_LOST") {
//       console.error("Database connection was closed.");
//     }
//     if (err.code === "ER_CON_COUNT_ERROR") {
//       console.error("Database has too many connections.");
//     }
//     if (err.code === "ECONNREFUSED") {
//       console.error("Database connection was refused.");
//     }
//   }
//   console.log("Connected");
//   if (conn) conn.release();
//   return;
// });

const sessionStore = new MySQLStore({
  ...mysqlOptions,
  clearExpired: true, // 期限切れのセッションを削除
  checkExpirationInterval: 900000, // 15分ごとにセッションの期限をチェック
  expiration: 86400000, // セッションの有効期限（ミリ秒単位）
});

const ses_opt = {
  secret: "SECRET",
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    // secure: true, // HTTPSを使用
    domain: "localhost",
    httpOnly: true, // XSS攻撃を防ぐ
    sameSite: "strict", // CSRF攻撃を防ぐ
    maxAge: 12 * 60 * 60 * 1000, // セッションの有効期限を設定（例: 24時間）
  },
  genid: function (req) {
    return crypto
      .createHash("sha256")
      .update(uuid.v1())
      .update(crypto.randomBytes(256))
      .digest("hex");
  },
};

app.use(session(ses_opt));

app.listen(WEB_SERVER_PORT, () => {
  console.log("サーバーを起動中・・・");
});

// ルートパスへのGETリクエストを処理
app.get("/", (req, res) => {
  // セッション内の認証情報をチェックしてリダイレクト先を決定
  if (req.session.authenticated) {
    // 認証されている場合は/posts/homeにリダイレクト
    res.redirect("http://localhost:3000/api/posts/home");
  } else {
    req.session.foo = 'some text here';
    // 認証されていない場合は/auth/loginにリダイレクト
    res.redirect("http://localhost:3000/api/auth/login");
  }
});

module.exports = {
  connection,
  session,
};
