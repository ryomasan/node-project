const express = require("express");
const mysql = require("mysql");
const app = express();
const cors = require("cors");
const PORT = 3306;
const auth = require("./routes/auth");

app.use(cors());

const connection = mysql.createPool(
    {
        host:'localhost',
        user:'root',
        password:'',
        port : PORT,
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

app.listen(PORT, () => {
    console.log("サーバーを起動中・・・");
});

module.exports= { 
    connection,
    // bodyParser
}