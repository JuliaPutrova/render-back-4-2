const express = require("express");
const { authenticate } = require("../../middlewares");
const { User } = require("../../models");
const router = express.Router();

router.get("/logout", authenticate, async (req, res, next) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: null });
  res.status(204).send();
});

router.get("/current", authenticate, async (req, res, next) => {
  try {
    // const { _id } = req.user;
    // const currentUser = await User.findById(_id);
    // res.json(currentUser);
    const { name, email } = req.user;
    res.json({
      user: { name, email },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
