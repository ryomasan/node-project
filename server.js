const express = require("express");
const mysql = require("mysql");
const app = express();
const cors = require("cors");
const WEB_SERVER_PORT = 8000; // Webサーバーのポート番号
const DB_PORT = 3306;
const auth = require("./routes/auth");
const session = require('express-session');

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: true, // HTTPSを使用
        httpOnly: true, // XSS攻撃を防ぐ
        sameSite: 'strict', // CSRF攻撃を防ぐ
        maxAge: 24 * 60 * 60 * 1000 // セッションの有効期限を設定（例: 24時間）
    }
}));

app.use(cors());

app.get('/', (req, res) => {
    console.log(req.session);
    // if (req.session.authenticated) {
    //     res.redirect('/login');
    // } else {
    //     // ユーザーが未認証の場合、ログインページにリダイレクト
    //     res.redirect('/login');
    // }
});

const connection = mysql.createPool(
    {
        host:'localhost',
        user:'root',
        password:'',
        port : DB_PORT,
        database:'tt_diary',
    }
)

connection.getConnection((err, conn) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.')
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.')
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.')
        }
    }
    console.log('Connected')
    if (conn) conn.release()
    return
})

app.use(express.json());
app.use("/auth", auth);

app.listen(WEB_SERVER_PORT, () => {
    console.log("サーバーを起動中・・・");
});

module.exports= { 
    connection,
    session
}