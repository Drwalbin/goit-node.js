// const fs = require("fs/promises");

// const isAccessible = async (path) => {
//   try {
//     await fs.access(path);
//     return true;
//   } catch (error) {
//     return false;
//   }
// };

// const createFolderIsNotExist = async (folder) => {
//   if (!(await isAccessible(folder))) {
//     try {
//       await fs.mkdir(folder);
//     } catch (error) {
//       console.error("Nie udało się utworzyć folderu:", error);
//     }
//   }
// };

// const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// module.exports = { createFolderIsNotExist, sleep };

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
