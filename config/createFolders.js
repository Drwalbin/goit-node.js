const fs = require("fs/promises");

const isAccessible = (path) => {
  return fs
    .access(path)
    .then(() => true)
    .catch(() => false);
};

const createFolderIsNotExist = async (folder) => {
  if (!(await isAccessible(folder))) {
    await fs.mkdir(folder);
  }
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

module.exports = { createFolderIsNotExist, sleep };
