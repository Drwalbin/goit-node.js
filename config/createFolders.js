const fs = require("fs/promises");

const isAccessible = async (path) => {
  try {
    await fs.access(path);
    return true;
  } catch (error) {
    return false;
  }
};

const createFolderIsNotExist = async (folder) => {
  if (!(await isAccessible(folder))) {
    try {
      await fs.mkdir(folder);
    } catch (error) {
      console.error("Nie udało się utworzyć folderu:", error);
    }
  }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = { createFolderIsNotExist, sleep };
