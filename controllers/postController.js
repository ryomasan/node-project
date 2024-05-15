const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const config = require("../config");
const { validationResult, body } = require("express-validator");

async function index(req, res) {
  // const { connection } = require("../server");
  try {
    // const results = await new Promise((resolve, reject) => {
    //   connection.query("SELECT * FROM `users`", (error, results) => {
    //     if (error) {
    //       console.log("Error fetching users: ", error);
    //       reject("ユーザーの取得に失敗しました");
    //     } else {
    //       console.log("Fetched users: ", results);
    //       resolve(results);
    //     }
    //   });
    // });
    // return res.status(200).json(results);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "ユーザーの取得に失敗しました" });
  }
}

module.exports = {
  index,
};
