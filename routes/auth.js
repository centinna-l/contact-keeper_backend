const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const auth = require("../middelwares/auth");
//Always use Async and Await
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      msg: "Internal Server Error",
    });
  }
});

router.post(
  "/",
  [
    check("email", "Please enter a valid email").isEmail(),
    check("password", "Please enter pasdword").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        res.status(400).json({
          error: "Invalid Credentails",
        });
      }
      let isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(400).json({
          error: "Invalid Password",
        });
      }
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
            token: token,
          });
        }
      );
    } catch (error) {
      console.log(error.message);
      res.status(500).json({
        error: "Internal Server Error",
      });
    }
  }
);

module.exports = router;
