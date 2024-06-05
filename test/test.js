const request = require("supertest");
const app = require("../server");

//import utils for my inputs in user testing
const {
  registerUser,
  registerUserForDelete,
  loginUserForDelete,
  loginUser,
  adminLogin,
  updateUserDetails,
} = require("../utils/userData.utils");

//import utils for my inputs in product testing
const {
  loginForProduct,
  registerProduct,
} = require("../utils/productData.utils");

//variable for user
let tokenUser = "";
let tokenAdmin = "";
let newUserId = 0;

//variable for product
let newProductId = 0;

//THIS IS THE START FOR USER ENDPOINT API TEST
describe("POST /register Registers a new user.", () => {
  test("should create a user", async () => {
    return request(app)
      .post("/users/register")
      .send(registerUser)
      .accept("application/json")
      .expect(201)
      .then((res) => {
        expect(res.body).toHaveProperty("message", "User created successfully");
        expect(res.body).toHaveProperty("user");
        newUserId = res.body.user.id;
      });
  });

  test("should not create a user if email already exists", async () => {
    return request(app)
      .post("/users/register")
      .send(registerUser)
      .accept("application/json")
      .expect(400)
      .then((res) => {
        expect(res.body).toHaveProperty("message", "Email already exists");
      });
  });

  test("should not create if fields are not completed", async () => {
    return request(app)
      .post("/users/register")
      .send({ email: registerUser.email })
      .accept("application/json")
      .expect(400)
      .then((res) => {
        expect(res.body).toHaveProperty("message", "All fields are required");
      });
  });

  test("should not create password and password_confirmation does not match", async () => {
    return request(app)
      .post("/users/register")
      .send({
        email: "newEmail@example.com",
        password: registerUser.password,
        password_confirmation: "wrongpassword1234",
      })
      .accept("application/json")
      .expect(400)
      .then((res) => {
        expect(res.body).toHaveProperty(
          "message",
          "Password and password confirmation does not match"
        );
      });
  });
});

describe("POST /login", () => {
  test("should login if the credentials are correct", async () => {
    return request(app)
      .post("/login")
      .send(loginUser)
      .accept("application/json")
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty(
          "message",
          "User logged in successfully"
        );
        expect(res.body).toHaveProperty("token");
        tokenUser = res.body.token;
      });
  });

  test("should not login if fields are not complete ", async () => {
    return request(app)
      .post("/login")
      .send({ email: loginUser.email })
      .accept("application/json")
      .expect(400)
      .then((res) => {
        expect(res.body).toHaveProperty("message", "All fields are required");
      });
  });

  test("should not login if credentials are incorrect", async () => {
    return request(app)
      .post("/login")
      .send({
        email: "jericho@test",
        password: "test@1243",
      })
      .accept("application/json")
      .expect(401)
      .then((res) => {
        expect(res.body).toHaveProperty(
          "message",
          "email or password is incorrect"
        );
      });
  });
});

describe("GET /users  Retrieves a list of users.", () => {
  test("should login as an admin", async () => {
    return request(app)
      .post("/login")
      .send(adminLogin)
      .accept("application/json")
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty(
          "message",
          "User logged in successfully"
        );
        expect(res.body).toHaveProperty("token");
        tokenAdmin = res.body.token;
      });
  });

  test("should get the users list if admin", async () => {
    return request(app)
      .get("/users")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .accept("application/json")
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty("users");
      });
  });

  test("should not get the users list if not admin", async () => {
    return request(app)
      .get("/users")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .accept("application/json")
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty("users");
      });
  });
});

describe("GET /users/:id Retrieves a specific user by ID.", () => {
  test("should get his/her own user information", async () => {
    return request(app)
      .get(`/users/${newUserId}`)
      .send(loginUser)
      .set("Authorization", `Bearer ${tokenUser}`)
      .accept("application/json")
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty("user");
      });
  });

  test("should not get the user information that is not own", async () => {
    return request(app)
      .get("/users/2")
      .set("Authorization", `Bearer ${tokenUser}`)
      .accept("application/json")
      .expect(401)
      .then((res) => {
        expect(res.body).toHaveProperty("message", "Unauthorized");
      });
  });
});

describe("PUT /users/:id Updates user information.", () => {
  test("should update their own user account", async () => {
    return request(app)
      .put(`/users/${newUserId}`)
      .set("Authorization", `Bearer ${tokenUser}`)
      .send(updateUserDetails)
      .accept("application/json")
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty("message", "User updated successfully");
      });
  });

  test("should not update other users account", async () => {
    return request(app)
      .put(`/users/2`)
      .set("Authorization", `Bearer ${tokenUser}`)
      .send(updateUserDetails)
      .accept("application/json")
      .expect(401)
      .then((res) => {
        expect(res.body).toHaveProperty("message", "unauthorized");
      });
  });

  test("should not update account if field is not completed", async () => {
    return request(app)
      .put(`/users/${newUserId}`)
      .set("Authorization", `Bearer ${tokenUser}`)
      .send({
        email: "newEmail@example.com",
        password: "password123",
      })
      .accept("application/json")
      .expect(400)
      .then((res) => {
        expect(res.body).toHaveProperty("message", "all fields are required.");
      });
  });

  test("should not update account if email already exists", async () => {
    return request(app)
      .put(`/users/${newUserId}`)
      .set("Authorization", `Bearer ${tokenUser}`)
      .send(updateUserDetails)
      .accept("application/json")
      .expect(400)
      .then((res) => {
        expect(res.body).toHaveProperty("message", "email is already exist.");
      });
  });

  test("should not update account if password and password_confirmation does not match", async () => {
    return request(app)
      .put(`/users/${newUserId}`)
      .set("Authorization", `Bearer ${tokenUser}`)
      .send({
        email: "newEmail@example.com",
        password: "password123",
        password_confirmation: "wrongpassword1234",
      })
      .accept("application/json")
      .expect(400)
      .then((res) => {
        expect(res.body).toHaveProperty("message", "password not matched.");
      });
  });
});

describe("DELETE /users/:id Deletes a user by ID.", () => {
  let userForDelete = 0;
  let tokenUserForDelete = "";
  test("should create a user --for delete", async () => {
    return request(app)
      .post("/users/register")
      .send(registerUserForDelete)
      .accept("application/json")
      .expect(201)
      .then((res) => {
        expect(res.body).toHaveProperty("message", "User created successfully");
        expect(res.body).toHaveProperty("user");
        userForDelete = res.body.user.id;
      });
  });

  test("should login if the credentials are correct --for delete", async () => {
    return request(app)
      .post("/login")
      .send(loginUserForDelete)
      .accept("application/json")
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty(
          "message",
          "User logged in successfully"
        );
        expect(res.body).toHaveProperty("token");
        tokenUserForDelete = res.body.token;
      });
  });

  test("should not delete the user that is not own", async () => {
    return request(app)
      .get("/users/2")
      .set("Authorization", `Bearer ${tokenUserForDelete}`)
      .accept("application/json")
      .expect(401)
      .then((res) => {
        expect(res.body).toHaveProperty("message", "Unauthorized");
      });
  });

  test("should delete his/her account", async () => {
    return request(app)
      .delete(`/users/${userForDelete}`)
      .set("Authorization", `Bearer ${tokenUserForDelete}`)
      .accept("application/json")
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty("message", "User deleted successfully");
      });
  });

  test("should delete any account if admin", async () => {
    return request(app)
      .delete(`/users/3`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .accept("application/json")
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty("message", "User deleted successfully");
      });
  });
});

//THIS IS THE END FOR USER ENDPOINT API TEST

//THIS IS THE START FOR PRODUCT ENDPOINT API TEST
describe("POST /products Creates a new product.", () => {
  test("authenticate before creating a product", async () => {
    return request(app)
      .post("/login")
      .send(loginForProduct)
      .accept("application/json")
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty(
          "message",
          "User logged in successfully"
        );
        expect(res.body).toHaveProperty("token");
        tokenUser = res.body.token;
      });
  });

  test("should not create a product if fields are missing", async () => {
    return request(app)
      .post("/products")
      .send({ product_name: "Test Product" })
      .set("Authorization", `Bearer ${tokenUser}`)
      .accept("application/json")
      .expect(400)
      .then((res) => {
        expect(res.body).toHaveProperty("message", "Please fill all fields.");
      });
  });

  test("should not create a product if product_name is not a string", async () => {
    return request(app)
      .post("/products")
      .set("Authorization", `Bearer ${tokenUser}`)
      .send({
        product_name: 123,
        product_description: "Test Description",
        product_price: 100.0,
        product_tag: ["tag1"],
      })

      .accept("application/json")
      .expect(400)
      .then((res) => {
        expect(res.body).toHaveProperty(
          "message",
          "Product name must be a string."
        );
      });
  });

  test("should not create a product if product_description is not a string", async () => {
    return request(app)
      .post("/products")
      .set("Authorization", `Bearer ${tokenUser}`)
      .send({
        product_name: "Test Product",
        product_description: 123,
        product_price: 100.0,
        product_tag: ["tag1"],
      })

      .accept("application/json")
      .expect(400)
      .then((res) => {
        expect(res.body).toHaveProperty(
          "message",
          "Product description must be text."
        );
      });
  });

  test("should not create a product if product_price is not a number", async () => {
    return request(app)
      .post("/products")
      .set("Authorization", `Bearer ${tokenUser}`)
      .send({
        product_name: "Test Product",
        product_description: "Test Description",
        product_price: "100.0",
        product_tag: ["tag1"],
      })

      .accept("application/json")
      .expect(400)
      .then((res) => {
        expect(res.body).toHaveProperty(
          "message",
          "Product price must be a decimal number."
        );
      });
  });

  test("should not create a product if product_price is negative", async () => {
    return request(app)
      .post("/products")
      .set("Authorization", `Bearer ${tokenUser}`)
      .send({
        product_name: "Test Product",
        product_description: "Test Description",
        product_price: -10.0,
        product_tag: ["tag1"],
      })
      .accept("application/json")
      .expect(400)
      .then((res) => {
        expect(res.body).toHaveProperty(
          "message",
          "Product price must be at least 0."
        );
      });
  });

  test("should not create a product if product_tag is not an array", async () => {
    return request(app)
      .post("/products")
      .set("Authorization", `Bearer ${tokenUser}`)
      .send({
        product_name: "Test Product",
        product_description: "Test Description",
        product_price: 100.0,
        product_tag: "tag1",
      })

      .accept("application/json")
      .expect(400)
      .then((res) => {
        expect(res.body).toHaveProperty(
          "message",
          "Product tag must be an array."
        );
      });
  });

  test("should create a product", async () => {
    return request(app)
      .post("/products")
      .send(registerProduct)
      .set("Authorization", `Bearer ${tokenUser}`)
      .accept("application/json")
      .expect(201)
      .then((res) => {
        expect(res.body).toHaveProperty(
          "message",
          "Product added successfully"
        );
        expect(res.body).toHaveProperty("product");
        newProductId = res.body.product.id;
      });
  });
});

describe("GET /products Retrieves the list of products. --PUBLIC  ", () => {
  test("should get the list of products", async () => {
    return request(app)
      .get("/products")
      .accept("application/json")
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty("products");
      });
  });
});

describe("GET /products Retrieves the  product by specific id.   ", () => {
  test("should get the list of product information using id", async () => {
    return request(app)
      .get(`/products/${newProductId}`)
      .accept("application/json")
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty("product");
      });
  });

  test("should not get the product if not found", async () => {
    return request(app)
      .get(`/products/200`)
      .accept("application/json")
      .expect(404)
      .then((res) => {
        expect(res.body).toHaveProperty("message", "product not found.");
      });
  });
});

describe("PUT /products/:id Updates a product by ID.", () => {
  test("should not update a product if the user is not the owner", async () => {
    return request(app)
      .post("/login")
      .send(loginForProduct)
      .accept("application/json")
      .expect(200)
      .then((res) => (tokenUser = res.body.token));
  });

  test("should not update if the user is not the owner", async () => {
    return request(app)
      .put(`/products/1`)
      .set("Authorization", `Bearer ${tokenUser}`)
      .send({
        product_name: "Updated Product",
        product_description: "Updated Description",
        product_price: 99.99,
        product_tag: ["updated", "test"],
      })
      .accept("application/json")
      .expect(401)
      .then((res) => {
        expect(res.body).toHaveProperty("message", "Unauthorized update");
      });
  });

  test("should not update a product if it does not exist", async () => {
    return request(app)
      .put(`/products/9999`)
      .set("Authorization", `Bearer ${tokenUser}`)
      .send({
        product_name: "Updated Product",
        product_description: "Updated Description",
        product_price: 99.99,
        product_tag: ["updated", "test"],
      })
      .accept("application/json")
      .expect(404)
      .then((res) => {
        expect(res.body).toHaveProperty("message", "Product not found");
      });
  });

  test("should return validation errors for invalid input data", async () => {
    await request(app)
      .put(`/products/${newProductId}`)
      .set("Authorization", `Bearer ${tokenUser}`)
      .send({
        product_name: 123,
        product_description: "sample update",
        product_price: "500",
        product_tag: "not array",
      })
      .accept("application/json")
      .expect(400)
      .then((res) => {
        expect(res.body).toHaveProperty("message");
      });
  });

  test("should return validation errors if fields are not filled", async () => {
    return request(app)
      .put(`/products/${newProductId}`)
      .set("Authorization", `Bearer ${tokenUser}`)
      .send({
        product_name: "",
        product_description: "",
        product_price: undefined,
        product_tag: [],
      })
      .accept("application/json")
      .expect(400)
      .then((res) => {
        expect(res.body).toHaveProperty("message", "Please fill all fields.");
      });
  });

  test("should update a product successfully", async () => {
    return request(app)
      .put(`/products/${newProductId}`)
      .set("Authorization", `Bearer ${tokenUser}`)
      .send({
        product_name: "Updated Product",
        product_description: "Updated Description",
        product_price: 99.99,
        product_tag: ["updated", "test"],
      })
      .accept("application/json")
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty(
          "message",
          "Product updated successfully"
        );
      });
  });
});

describe("DELETE /products/:id Deletes a product by ID.", () => {
  test("authenticate before deleting a product", async () => {
    return request(app)
      .post("/login")
      .send(loginForProduct)
      .accept("application/json")
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty(
          "message",
          "User logged in successfully"
        );
        expect(res.body).toHaveProperty("token");
        tokenUser = res.body.token;
      });
  });

  test("should not delete a product that is not existing", async () => {
    return request(app)
      .delete(`/products/200`)
      .set("Authorization", `Bearer ${tokenUser}`)
      .accept("application/json")
      .expect(404)
      .then((res) => {
        expect(res.body).toHaveProperty("message", "product not found");
      });
  });

  test("should not delete a product is not owned by current user", async () => {
    return request(app)
      .delete(`/products/1`)
      .set("Authorization", `Bearer ${tokenUser}`)
      .accept("application/json")
      .expect(401)
      .then((res) => {
        expect(res.body).toHaveProperty("message", "unauthorized deletion");
      });
  });

  test("should not delete a product if no token is provided", async () => {
    return request(app)
      .delete(`/products/${newProductId}`)
      .accept("application/json")
      .expect(401)
      .then((res) => {
        expect(res.body).toHaveProperty("message", "Unauthorized access");
      });
  });

  test("should delete a product successfully", async () => {
    return request(app)
      .delete(`/products/${newProductId}`)
      .set("Authorization", `Bearer ${tokenUser}`)
      .accept("application/json")
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty(
          "message",
          "product deleted successfully"
        );
      });
  });
});
