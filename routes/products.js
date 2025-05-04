
const router = require("express").Router();
const Product = require("../models/Product"); // Ensure this is imported


// const Product = require("../models/Product");
// const {
//   verifyToken,
//   verifyTokenAndAuthorization,
//   verifyTokenAndAdmin,
// } = require("./verifyToken");


// //CREATE

// router.post("/", verifyTokenAndAdmin, async (req, res) => {
//   const newProduct = new Product(req.body);

//   try {
//     const savedProduct = await newProduct.save();
//     res.status(200).json(savedProduct);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// //UPDATE
// router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
//   try {
//     const updatedProduct = await Product.findByIdAndUpdate(
//       req.params.id,
//       {
//         $set: req.body,
//       },
//       { new: true }
//     );
//     res.status(200).json(updatedProduct);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// //DELETE
// router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
//   try {
//     await Product.findByIdAndDelete(req.params.id);
//     res.status(200).json("Product has been deleted...");
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// GET PRODUCT
router.get("/find/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});


// GET ALL PRODUCTS
router.get("/", async (req, res) => {
  console.log('Received request for products'); // Add this
  const qNew = req.query.new;
  const qCategory = req.query.category;
  try {
      let products;

      if (qNew) {
          products = await Product.find().limit(1);
      } else if (qCategory) {
          products = await Product.find({
              categories: {
                  $in: [qCategory],
              },
          });
      } else {
          products = await Product.find();
      }
      
      console.log('Products found:', products.length); // Add this
      res.status(200).json(products);
  } catch (err) {
      console.error('Error fetching products:', err); // Add this
      res.status(500).json(err);
  }
});

module.exports = router;