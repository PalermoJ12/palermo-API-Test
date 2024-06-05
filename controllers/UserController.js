const bcrypt = require("bcrypt"); //importing bcrypt for hashing
const jwt = require("jsonwebtoken"); //importing jwt for token generation to authenticate the user
const fsPromises = require("fs").promises;
const path = require("path");

//importing model user.json that serves as my database for crud operations
const usersDB = {
  //This serves as my database with table of users
  users: require("../model/user.json"),

  //This serves as my setUsers function to update the value of users
  setUsers: function (data) {
    this.users = data;
  },
};

const userController = {
  postRegister: async (req, res) => {
    // destructuring the request body
    const { email, password, password_confirmation } = req.body;
    // checking if all fields are filled
    if (!email || !password || !password_confirmation) {
      return res.status(400).json({ message: "All fields are required" });
    }
    // finding the body email if it already exists
    const emailExists = usersDB.users.find((user) => user.email === email);

    // checking if email already exists
    if (emailExists) {
      return res.status(400).json({ message: "Email already exists" });
    }
    // checking if password and password confirmation does not match
    const passwordCompare = password === password_confirmation;

    if (!passwordCompare) {
      // if password and password confirmation does not match returns error
      return res
        .status(400)
        .json({ message: "Password and password confirmation does not match" });
    }

    try {
      // generating salt
      const salt = await bcrypt.genSalt();
      // hashing the password
      const hashedPassword = await bcrypt.hash(password, salt);
      // creating a new user
      const newUser = {
        id: usersDB.users.length + 1,
        email,
        password: hashedPassword,
        role: "user",
      };
      // adding the new user to the users array
      usersDB.setUsers([...usersDB.users, newUser]);
      // writing the users array to the user.json file (my database)
      await fsPromises.writeFile(
        path.join(__dirname, "..", "model", "user.json"),
        JSON.stringify(usersDB.users)
      );

      // returning the new user
      return res.status(201).json({
        message: "User created successfully",
        user: newUser,
      });
    } catch (err) {
      // if there is an error returns error
      return res
        .status(500)
        .json({ message: "There is an error creating the user." });
    }
  },
  postLogin: async (req, res) => {
    // destructuring the request body
    const { email, password } = req.body;

    // checking if all fields are filled
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // finding the body email if existing
    const userExists = usersDB.users.find((user) => user.email === email);
    //password compare using bcrypt
    const passwordCompare = await bcrypt.compare(password, userExists.password);
    // checking if email or password is incorrect
    if (!userExists || !passwordCompare) {
      return res
        .status(401)
        .json({ message: "email or password is incorrect" });
    }

    // generating token
    const token = jwt.sign(
      {
        userId: userExists.id,
        role: userExists.role,
      },
      process.env.SECRET_KEY,
      { expiresIn: "1d" }
    );

    // returning the token
    return res.status(200).json({
      message: "User logged in successfully",
      token: token,
    });
  },

  getUsers: (req, res) => {
    // checking if the user is an admin
    req.auth.role === process.env.ADMIN_ROLE
      ? // if yes return all users
        res.status(200).json({ users: usersDB.users })
      : // if not return unauthorized
        res.status(401).json({ message: "Unauthorized" });
  },

  getUserById: (req, res) => {
    //getting the id from the request params
    const { id } = req.params;

    // checking if the user is an admin or the owner of the account
    if (id == req.auth.userId || req.auth.role === process.env.ADMIN_ROLE) {
      /// checking if the user exists
      const user = usersDB.users.find((user) => user.id == id);

      if (user) {
        // if yes return the user
        return res.status(200).json({ user });
      }

      // if not return not found
      return res.status(404).json({ message: "User not found." });
    }
    // if not return unauthorized
    return res.status(401).json({ message: "Unauthorized" });
  },
  deleteUser: async (req, res) => {
    //getting the id from the request params
    const { id } = req.params;
    //assigning the users array to a variable
    const usersData = usersDB.users;

    // checking if the user is an admin or the owner of the account
    if (id == req.auth.userId || req.auth.role === process.env.ADMIN_ROLE) {
      // checking if the user exists
      const userIndex = usersData.findIndex((user) => user.id == id);

      if (userIndex !== -1) {
        // if yes delete the user
        usersData.splice(userIndex, 1);
        // updating the users array
        usersDB.setUsers(usersData);

        try {
          // writing the users array to the user.json file (my database)
          await fsPromises.writeFile(
            path.join(__dirname, "..", "model", "user.json"),
            JSON.stringify(usersDB.users)
          );

          // returning the deleted user
          return res.status(200).json({ message: "User deleted successfully" });
        } catch (error) {
          // if there is an error returns error
          return res
            .status(500)
            .json({ message: "There is an error deleting the user." });
        }
      }
      // if not return not found
      return res.status(404).json({ message: "User not found" });
    }

    // if not return unauthorized
    return res.status(401).json({ message: "Unauthorized" });
  },

  updateUser: async (req, res) => {
    //getting the id from the request params
    const { id } = req.params;
    //destructuring the request body
    const { email, password, password_confirmation } = req.body;
    //assigning the users array to a variable
    const userData = usersDB.users;
    //Check if email is unique using variabel emailUnique
    const emailUnique = userData.find((user) => user.email == email);

    if (id == req.auth.userId || req.auth.role === process.env.ADMIN_ROLE) {
      // checking if all fields are filled
      if ((!email, !password, !password_confirmation)) {
        return res.status(400).json({ message: "all fields are required." });
      }

      // checking if email is unique
      if (emailUnique) {
        return res.status(400).json({ message: "email is already exist." });
      }
      // checking if password and password_confirmation does not match
      if (password !== password_confirmation) {
        return res.status(400).json({ message: "password not matched." });
      }

      // checking if the user exists
      const userIndex = userData.findIndex((user) => user.id == id);

      if (userIndex) {
        // if yes update the user
        // hashing the password
        const salt = await bcrypt.genSalt();
        // updating the user
        userData[userIndex].email = email;
        userData[userIndex].password = await bcrypt.hash(password, salt);
        // updating the users array
        usersDB.setUsers(userData);

        try {
          // writing the users array to the user.json file (my database)
          await fsPromises.writeFile(
            path.join(__dirname, "..", "model", "user.json"),
            JSON.stringify(usersDB.users)
          );

          return res.status(200).json({ message: "User updated successfully" });
        } catch (error) {
          // if there is an error returns error
          return res
            .status(500)
            .json({ message: "There is an error updating the user" });
        }
      }

      return res.status(404).json({ message: "user not found." });
    }

    return res.status(401).json({ message: "unauthorized" });
  },
};
module.exports = userController;
