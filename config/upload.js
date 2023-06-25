const path = require("path");
const multer = require("multer");

const AVATAR_DIRECTORY = path.join(process.cwd(), "public", "avatars");
const UPLOAD_DIRECTORY = path.join(process.cwd(), "tmp");

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, UPLOAD_DIRECTORY);
  },
  filename: (req, file, callback) => {
    const date = Date.now();
    const rnd = Math.floor(Math.random() * 1_000_000);
    const name = [date, rnd, file.originalname].join("_");
    callback(null, name);
  },
  limits: { fileSize: 1_048_576 },
});

const upload = multer({
  storage: storage,
});

module.exports = { UPLOAD_DIRECTORY, AVATAR_DIRECTORY, upload };
