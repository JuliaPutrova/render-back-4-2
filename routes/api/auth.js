const express = require("express");
const { User } = require("../../models");
const { joiRegisterSchema } = require("../../models/user");
const { joiLoginSchema } = require("../../models/user.js");
const { BadRequest, Conflict, Unauthorized } = require("http-errors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = process.env;

// const password = "12345";
// const salt = bcrypt.genSaltSync(10);
// const hashPassword = bcrypt.hashSync(password, salt);
// console.log(hashPassword);
// const compareResult = bcrypt.compareSync(password, hashPassword);
// console.log(compareResult);

// const hashPassword = async (pass) => {
//   const salt = await bcrypt.genSalt(10);
//   const result = await bcrypt.hash(pass, salt);
//   const compareResult = await bcrypt.compare(pass, result);
//   console.log(compareResult);
// };
// hashPassword(password);

const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const { error } = joiRegisterSchema.validate(req.body);
    if (error) {
      throw new BadRequest(error.message);
    }
    const { name, email, password } = req.body;

    const user = await User.findOne({ email });
    if (user) {
      throw new Conflict("User already exist");
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({ name, email, password: hashPassword });

    res.status(201).json({
      user: {
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { error } = joiLoginSchema.validate(req.body);
    if (error) {
      throw new BadRequest(error.message);
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    console.log(user);
    if (!user) {
      throw new Unauthorized("email not found");
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      throw new Unauthorized("password wrong");
    }

    const payload = {
      id: user._id,
    };

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });

    await User.findByIdAndUpdate(user._id, { token });

    res.json({
      token,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

/**
 * {
    "name": "Julia",
    "email": "Julia@gmail.com",
    "password": "147852"
}
 */
