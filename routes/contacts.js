const express = require("express");
const auth = require("../middelwares/auth");
const User = require("../models/User");
const Contact = require("../models/Contact");
const { check, validationResult } = require("express-validator");

const router = express.Router();
//This is also a Protected route
router.get("/", auth, async (req, res) => {
  try {
    const contacts = await Contact.find({ user: req.user.id }).sort({
      date: -1,
    }); //returns a list
    res.status(200).json(contacts);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      msg: "Internal Server Error",
    });
  }
});
//This is also a Protected route
router.post(
  "/",
  [auth, [check("name", "name is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        errors: errors.array(),
      });
    }
    const { name, email, phone, type } = req.body;
    console.log();
    try {
      const newContact = await new Contact({
        name,
        email,
        phone,
        type,
        user: req.user.id,
      });
      const contact = await newContact.save();
      res.status(200).json(contact);
    } catch (error) {
      console.log(error.message);
      res.status(500).json({
        msg: "Internal Server Error",
      });
    }
  }
);
//This is also a Protected route
router.put("/:id", auth, async (req, res) => {
  const { name, email, phone, type } = req.body;
  //build a contact object
  const contactFields = {};
  if (name) contactFields.name = name;
  if (email) contactFields.email = email;
  if (phone) contactFields.phone = phone;
  if (type) contactFields.type = type;
  try {
    let contact = await Contact.findById(req.params.id);
    if (!contact) {
      res.status(404).json({
        msg: "Contact Not Found",
      });
    }
    //Make sure user owns the contact
    if (contact.user.toString() !== req.user.id) {
      res.status(401).json({
        msg: "Permission Denied",
      });
    }
    contact = await Contact.findByIdAndUpdate(
      req.params.id,
      {
        $set: contactFields,
      },
      { new: true }
    );
    res.status(200).json(contact);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      msg: "Internal Server Error",
    });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    let contact = await Contact.findById(req.params.id);
    if (!contact) {
      res.status(404).json({
        msg: "Contact Not Found",
      });
    }
    //Make sure user owns the contact
    if (contact.user.toString() !== req.user.id) {
      res.status(401).json({
        msg: "Permission Denied",
      });
    }
    await Contact.findByIdAndRemove(req.params.id);
    res.status(200).json({
      msg: "Contact Removed!",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      msg: "Internal Server Error",
    });
  }
});

module.exports = router;
