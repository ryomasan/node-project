const express = require("express");
// const mysql = require("mysql")
const app = express();
const PORT = 8000;
const auth = require("./routes/auth");

// const connection = mysql.createConnection(
//     {
//         host:"localhost",
//         user:'root',
//         password:'',
//         database:'tt_diary'
//     }
// )

// connection.connect(((err)=>{
//     if (err) {
//         console.log('error connecting' + err.stack);
//         return;
//     }

// }))

app.use(express.json());
app.use("/auth", auth);

app.get("/",(req,res)=>{
    res.send("Hello Express");
});

app.listen(PORT,()=>{
    console.log("サーバーを起動中・・・");
});