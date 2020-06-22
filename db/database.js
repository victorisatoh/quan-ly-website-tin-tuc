const mongoose = require("mongoose");

// mongo atlas
const mongodb_url =
  "mongodb+srv://ndh1379:123123a@cluster0-dqfsn.gcp.mongodb.net/news-website?retryWrites=true&w=majority";

class Database {
  constructor() {
    this._connect();
  }

  _connect() {
    mongoose
      .connect(mongodb_url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
      })
      .then(() => {
        console.log("Database connection successfully!");
      })
      .catch((err) => {
        console.log("Database connection error!");
      });
  }
}

module.exports = new Database();
