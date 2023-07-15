const User = require("../service/schemas/user.js");

const findUserByEmail = async (email) => {
  return User.findOne({ email });
};

const addToken = async (id, token) => {
  return User.findByIdAndUpdate(id, { token });
};

const logOut = async (id) => {
  return User.findByIdAndUpdate(id, { token: null });
};

const updateSubscription = async (id, subscription) => {
  return User.findByIdAndUpdate(id, { subscription }, { new: true });
};

const updateAvatar = async (id, avatarURL) => {
  return User.findByIdAndUpdate(id, { avatarURL }, { new: true });
};

module.exports = {
  findUserByEmail,
  addToken,
  logOut,
  updateSubscription,
  updateAvatar,
};
