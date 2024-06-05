const fsPromises = require("fs").promises;
const path = require("path");

//same with user this product.json serves as my product database
const dbProduct = {
  //this serves as my database with table of products
  products: require("../model/product.json"),
  //this is my setProducts method to update the value of products
  setProducts: function (data) {
    this.products = data;
  },
};

module.exports = {
  addProduct: async (req, res) => {
    try {
      //extract the user id from the request
      const { userId } = req.auth;
      //destructure the request body
      const { product_name, product_description, product_price, product_tag } =
        req.body;

      // Validate data values if all fields are filled
      if (
        !product_name ||
        !product_description ||
        product_price === undefined ||
        !product_tag
      ) {
        return res.status(400).json({ message: "Please fill all fields." });
      }

      // Validate data types
      if (typeof product_name !== "string") {
        return res
          .status(400)
          .json({ message: "Product name must be a string." });
      }
      // Validate data types
      if (typeof product_description !== "string") {
        return res
          .status(400)
          .json({ message: "Product description must be text." });
      }
      // Validate data types
      if (typeof product_price !== "number" || isNaN(product_price)) {
        return res
          .status(400)
          .json({ message: "Product price must be a decimal number." });
      }
      // Validate data types
      if (!Array.isArray(product_tag)) {
        return res
          .status(400)
          .json({ message: "Product tag must be an array." });
      }
      // Validate price
      if (product_price < 0) {
        return res
          .status(400)
          .json({ message: "Product price must be at least 0." });
      }
      //create a new product
      const newProduct = {
        id: dbProduct.products.length + 1,
        product_name,
        product_description,
        product_price,
        product_tag,
        user_id: userId,
      };
      //add the new product to the products array
      dbProduct.setProducts([...dbProduct.products, newProduct]);
      //write the updated products array to the product.json file
      await fsPromises.writeFile(
        path.join(__dirname, "..", "model", "product.json"),
        JSON.stringify(dbProduct.products)
      );
      //return the new product
      return res
        .status(201)
        .json({ message: "Product added successfully", product: newProduct });
    } catch (err) {
      //if there is an error, return an error response
      return res
        .status(500)
        .json({ message: "There is an error adding this product." });
    }
  },
  getProducts: (req, res) => {
    //return the products array without authentication because the requirements is make it public
    res.status(200).json({ products: dbProduct.products });
  },
  getProductById: (req, res) => {
    //extract the product id from the request
    const { id } = req.params;
    //return the product with the matching id
    const product = dbProduct.products.find((product) => product.id == id);
    //return the product with the matching id
    product
      ? res.status(200).json({ product: product })
      : //if there is no product with the matching id, return an error response
        res.status(404).json({ message: "product not found." });
  },

  deleteProduct: async (req, res) => {
    //extract the product id from the request
    const { id } = req.params;
    //extract the user id from the request
    const { userId } = req.auth;
    //assign the products array to the productsData variable
    const productsData = dbProduct.products;
    //check if the product exists
    const productIndex = productsData.findIndex((product) => product.id == id);
    if (productIndex !== -1) {
      //check if the user is the owner of the product
      const checkIfOwner = productsData[productIndex].user_id == userId;
      if (!checkIfOwner) {
        //if the user is not the owner of the product, return an error response
        return res.status(401).json({ message: "unauthorized deletion" });
      }
      //remove the product from the products array
      productsData.splice(productIndex, 1);
      dbProduct.setProducts(productsData);
      //write the updated products array to the product.json file
      await fsPromises.writeFile(
        path.join(__dirname, "..", "model", "product.json"),
        JSON.stringify(productsData)
      );
      //return a success response
      return res.status(200).json({ message: "product deleted successfully" });
    } else {
      //if the product does not exist, return an error response
      return res.status(404).json({ message: "product not found" });
    }
  },
  updateProduct: async (req, res) => {
    //extract the product id from the request
    const { id } = req.params;
    //extract the user id from the request
    const { userId } = req.auth;
    //destructure the request body
    const { product_name, product_description, product_price, product_tag } =
      req.body;

    // Validate required fields
    if (
      !product_name ||
      !product_description ||
      product_price === undefined ||
      !product_tag
    ) {
      return res.status(400).json({ message: "Please fill all fields." });
    }

    // Validate data types
    if (typeof product_name !== "string") {
      return res
        .status(400)
        .json({ message: "Product name must be a string." });
    }

    if (typeof product_description !== "string") {
      return res
        .status(400)
        .json({ message: "Product description must be text." });
    }

    if (typeof product_price !== "number" || isNaN(product_price)) {
      return res
        .status(400)
        .json({ message: "Product price must be a decimal number." });
    }

    if (!Array.isArray(product_tag)) {
      return res.status(400).json({ message: "Product tag must be an array." });
    }

    if (product_price < 0) {
      return res
        .status(400)
        .json({ message: "Product price must be at least 0." });
    }

    //assign the products array to the productsData variable
    const productsData = dbProduct.products;
    //check if the product exists
    const productIndex = productsData.findIndex((product) => product.id == id);
    if (productIndex !== -1) {
      //check if the user is the owner of the product
      const checkIfOwner = productsData[productIndex].user_id == userId;
      if (!checkIfOwner) {
        //if the user is not the owner of the product, return an error response
        return res.status(401).json({ message: "Unauthorized update" });
      }

      //update the product in the products array
      productsData[productIndex].product_name = product_name;
      productsData[productIndex].product_description = product_description;
      productsData[productIndex].product_price = product_price;
      productsData[productIndex].product_tag = product_tag;
      //assign the updated products array to the productsData variable
      dbProduct.setProducts(productsData);
      //write the updated products array to the product.json file
      await fsPromises.writeFile(
        path.join(__dirname, "..", "model", "product.json"),
        JSON.stringify(productsData)
      );
      //return a success response
      return res.status(200).json({ message: "Product updated successfully" });
    } else {
      //if the product does not exist, return an error response
      return res.status(404).json({ message: "Product not found" });
    }
  },
};
