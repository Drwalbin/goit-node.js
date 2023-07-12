const mongoose = require("mongoose");
const app = require("./app");
const { createFolderIsNotExist } = require("./config/createFolders");
const { AVATAR_DIRECTORY, UPLOAD_DIRECTORY } = require("./config/upload");

require("dotenv").config();

const uriDb = process.env.DB_URI;
const PORT = process.env.PORT || 3000;

const connection = mongoose.connect(uriDb, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

connection
  .then(() => {
    app.listen(PORT, async () => {
      await createFolderIsNotExist(UPLOAD_DIRECTORY);
      await createFolderIsNotExist(AVATAR_DIRECTORY);
      console.log(`Server running. Use our API on port: ${PORT}`);
      console.log("Database connection successful");
    });
  })
  .catch((err) => {
    console.log(`Server not running. Error message: ${err.message}`);
    process.exit(1);
  });
