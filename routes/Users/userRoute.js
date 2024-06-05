const express = require("express");
const authUser = require("../../middleware/authUser"); //import the authUser middleware to secure api
const router = express.Router(); // create an express router to handle api routes
const userController = require("../../controllers/UserController"); //import the user controller that handles logic of my routes

//register routes
router.post("/users/register", userController.postRegister);
//login routes
router.post("/login", userController.postLogin);
//user get routes (only for authenticated admin role)
router.get("/users", authUser, userController.getUsers);
//user get by id routes (only for authenticated users  to get their own account)
router.get("/users/:id", authUser, userController.getUserById);
//user delete routes (only for authenticated users to delete their own account)
router.delete("/users/:id", authUser, userController.deleteUser);
//user update routes (only for authenticated users to update their own account)
router.put("/users/:id", authUser, userController.updateUser);
module.exports = router;
