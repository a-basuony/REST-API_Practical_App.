const express = require("express");
const { body } = require("express-validator");
const { signup } = require("../controllers/auth.controller");

const router = express.Router();

router.post(
  "/signup",
  [
    // validate user
    body("name").trim().isLength({ min: 3 }),
    body("email").trim().isEmail(),
    body("password")
      .trim()
      .isLength({ min: 4 })
      .isAlphanumeric() // for letters and numbers only
      //   .matches(/(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}/)
      .withMessage(
        "Password must contain an uppercase letter, a number and a special character"
      ),
    ,
  ],
  signup
);

module.exports = router;
