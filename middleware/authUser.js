const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    //initialize token variable to handle the bearer token in my header authorization for verifying the user
    const token = req.headers.authorization.split(" ")[1];
    //verify the token with the secret key using the jwt.verify method
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    //extract the user id and role from the decoded token
    const userId = decodedToken.userId;
    //store the user id and role in the request object
    const role = decodedToken.role;
    //pass the user id and role to the next middleware
    req.auth = { userId, role };
    //call the next to move on
    next();
  } catch (error) {
    //if there is an error, return an unauthorized response
    res.status(401).json({ message: "Unauthorized access" });
  }
};
