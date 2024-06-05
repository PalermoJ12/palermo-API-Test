const express = require("express");
const productController = require("../../controllers/ProductController"); //import the productController that handles process and logic of my routes
const router = express.Router(); // create an express router to handle api routes
const authUser = require("../../middleware/authUser"); //import the authUser middleware to secure api

// routes for adding the products (authentication required)
router.post("/products", authUser, productController.addProduct);
// routes for retrieving the products (public route)
router.get("/products", productController.getProducts);
// routes for retrieving the products by id (public route)
router.get("/products/:id", productController.getProductById);
// routes for deleting their own products (authentication required)
router.delete("/products/:id", authUser, productController.deleteProduct);
// routes for updating their own products (authentication required)
router.put("/products/:id", authUser, productController.updateProduct);
module.exports = router;
