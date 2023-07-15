const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const path = require("path");

const contactsRouter = require("./api/index");
const usersRouter = require("./api/userApi");

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.use("/api/contacts", contactsRouter);
app.use("/api/users", usersRouter);

app.use("/avatars", express.static(path.join(__dirname, "public/avatars")));
app.use("/users", usersRouter);
app.use((req, res) => {
  res
    .status(404)
    .json({ message: "Use api on routes: /api/contacts", data: "Not found" });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message, data: "Internal Server Error" });
});

const User = require("./service/schemas/user.js");

const findUserByEmail = async (email) => {
  return User.findOne({ email });
};

const addToken = async (id, token) =>
  await User.findByIdAndUpdate(id, { token });

const logOut = async (id) => await User.findByIdAndUpdate(id, { token: null });

const updateSubscription = async (id, body) =>
  User.findByIdAndUpdate(id, { subscription: body }, { new: true });

const updateAvatar = async (id, avatarURL) =>
  User.findByIdAndUpdate(id, { avatarURL }, { new: true });

module.exports = {
  findUserByEmail,
  addToken,
  logOut,
  updateSubscription,
  updateAvatar,
};

module.exports = app;
