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
app.use(express.urlencoded({ extended: false }));

require("./config/passport");

app.use(
  "/avatars",
  express.static(path.join(process.cwd(), "public", "avatars"))
);
app.use("/api/contacts", contactsRouter);
app.use("/api/users", usersRouter);

app.use((req, res) => {
  res
    .status(404)
    .json({ message: "Use api on routes: /api/contacts", data: "Not found" });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message, data: "Internal Server Error" });
});

module.exports = app;
