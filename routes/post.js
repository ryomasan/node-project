const router = require("express").Router();
const {
  query,
  validationResult,
  matchedData,
  body,
} = require("express-validator");
const { User } = require("../db/User");
// const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const config = require("../config");

module.exports = router;
