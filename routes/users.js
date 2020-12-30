const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
router.post(
  "/",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid Email").isEmail(),
    check(
      "password",
      "Please enter a password with more than 6 characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        errors: errors.array(),
      });
    }
    const { name, email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      console.log(user);
      if (user) {
        res.status(400).json({
          error: "Email Already Exists",
        });
      }
      user = await new User({
        name,
        email,
        password,
      });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      //save the user
      user.save();
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get("jwtsecrete"),
        {
          expiresIn: 3600000,
        },
        (err, token) => {
          if (err) throw err;
          res.status(200).json({
            msg: "User Saved",
            token: token,
          });
        }
      );
    } catch (error) {
      console.log(error.message);
      res.status(500).json({
        error: error.message,
      });
    }
  }
);

module.exports = router;
