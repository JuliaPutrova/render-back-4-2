const express = require("express");
const { Product } = require("../../models");
const { joiSchema } = require("../../models/product");
const { NotFound, BadRequest } = require("http-errors");
const { authenticate } = require("../../middlewares");

const router = express.Router();

router.get("/", authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const { _id } = req.user;
    const products = await Product.find(
      { owner: _id },
      "-createdAt -updatedAt",
      { skip, limit: +limit }
    );
    res.json(products);
  } catch (error) {
    next(error);
  }
});

// router.get("/:id", async (req, res, next) => {
//   const { id } = req.params;
//   try {
//     const productById = await Product.findOne({ _id: id });
//     if (!productById) {
//       throw new NotFound();
//     }
//     res.json(productById);
//   } catch (error) {
//     next(error);
//   }
// });

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const productById = await Product.findById(id);
    if (!productById) {
      throw new NotFound();
    }
    res.json(productById);
  } catch (error) {
    if (error.message.includes("Cast to ObjectId failed")) {
      error.status = 404;
    }
    next(error);
  }
});

router.post("/", authenticate, async (req, res, next) => {
  try {
    const { error } = joiSchema.validate(req.body);
    if (error) {
      throw new BadRequest(error.message);
    }

    const { _id } = req.user;
    const newProduct = await Product.create({ ...req.body, owner: _id });
    res.status(201).json(newProduct);
  } catch (error) {
    if (error.message.includes("validation failed")) {
      error.status = 400;
    }
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndRemove(id);

    if (!deletedProduct) {
      throw new NotFound();
    }

    res.status(200).json(deletedProduct);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updateProduct) {
      throw new NotFound();
    }

    res.json(updateProduct);
  } catch (error) {
    if (error.message.includes("validation failed")) {
      error.status = 400;
    }
    next(error);
  }
});

router.patch("/:id/active", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { active } = req.body;
    const updateProduct = await Product.findByIdAndUpdate(
      id,
      { active },
      {
        new: true,
      }
    );

    if (!updateProduct) {
      throw new NotFound();
    }
    res.json(updateProduct);
  } catch (error) {
    if (error.message.includes("validation failed")) {
      error.status = 400;
    }
    next(error);
  }
});

module.exports = router;

/**
 *   {
    "id": "767580d5-f509-4f45-98f9-28e74ec4af121",
    "name": "Ground almonds11",
    "price": 412,
    "location": "Home baking12"
  }
 */
