const express = require("express");
const dotenv = require("dotenv").config();
const bodyParser = require("body-parser");
const userRoute = require("./routes/Users/userRoute");
const productRoutes = require("./routes/Products/productRoute");
const app = express();
const PORT = process.env.PORT || 5000;
app.use(bodyParser.json());

//to use the userRoute endpoints
app.use(userRoute);
//to use the productRoute endpoints
app.use(productRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
