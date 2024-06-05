const registerUser = {
  email: "test@example.com",
  password: "password123",
  password_confirmation: "password123",
};

const registerUserForDelete = {
  email: "userfordelet@example.com",
  password: "delete123",
  password_confirmation: "delete123",
};

const updateUserDetails = {
  email: "userupdated@example.com",
  password: "updateduser123",
  password_confirmation: "updateduser123",
};
const loginUserForDelete = {
  email: "userfordelet@example.com",
  password: "delete123",
};

const loginUser = {
  email: "test@example.com",
  password: "password123",
};

const adminLogin = {
  email: "test@admin",
  password: "password",
};

module.exports = {
  registerUser,
  loginUser,
  updateUserDetails,
  adminLogin,
  registerUserForDelete,
  loginUserForDelete,
};
