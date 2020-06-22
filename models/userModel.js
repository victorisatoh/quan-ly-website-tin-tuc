const mongoose = require("mongoose"); // import mongoose
let Schema = mongoose.Schema; // use the mongoose schema object

// create Schema
let userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatarImage: {
    type: Buffer,
  },
  avatarImageType: {
    type: String,
  },
});

userSchema.virtual("avatarImagePath").get(function () {
  if (this.avatarImage != null && this.avatarImageType != null) {
    return `data:${this.avatarImageType};charset=utf-8;base64,${this.avatarImage.toString("base64")}`;
  } else {
    return "img/user.png";
  }
});

let UserModel = mongoose.model("User", userSchema, "users");

// Get all users
UserModel.getAllUser = () => {
  console.log("... RUN - UserModel.getAllUser()");
  const query = UserModel.find();
  return query;
};

// Get a user by email
UserModel.getUserByEmail = (email) => {
  console.log("... RUN - UserModel.getUserByEmail()");
  const query = UserModel.findOne({ email: email });
  return query;
};

// Add a user
UserModel.addUser = (userToAdd) => {
  console.log("... RUN - UserModel.addUser()");
  return userToAdd.save();
};

module.exports = UserModel;
