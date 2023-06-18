const service = require("../service/users.js");
const User = require("../service/schemas/user.js");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");

require("dotenv").config();
const secret = process.env.JWT_SECRET;

const signUp = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await service.findUserByEmail(email);

  if (user) return res.status(409).json({ message: "Email in use" });

  try {
    const avatar = gravatar.url(req.body.email, {
      s: "200", 
      r: "pg", 
      d: "mm", 
    });
    const newUser = new User(req.body);
    newUser.setPassword(password);
    await newUser.save();
    return res.status(201).json({
      message: "Registration successful",
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
        avatar,
      },
    });
  } catch (e) {
    console.error(e);
    next(e);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await service.findUserByEmail(email);
    if (!user || !user.validPassword(password))
      return res.status(401).json({ message: "Email or password is wrong" });
    const { id, subscription } = user;
    const payload = {
      id: id,
      email: email,
    };

    const token = jwt.sign(payload, secret, { expiresIn: "3h" });

    await service.addToken(id, token);
    res.status(200).json({
      token,
      user: {
        email,
        subscription,
      },
    });
  } catch (e) {
    next(e);
  }
};

const logout = async (req, res, next) => {
  const { id } = req.user;
  try {
    await service.logOut(id);
    res.status(204).json();
  } catch (e) {
    next(e);
  }
};

const currentUser = async (req, res, next) => {
  const { email, subscription } = req.user;
  try {
    res.json({
      status: "success",
      code: 200,
      user: {
        email,
        subscription,
      },
    });
  } catch (e) {
    next(e);
  }
};

const updateSubs = async (req, res, next) => {
  const { id, email } = req.user;
  const { subscription } = req.body;
  await service.updateSubscription(id, subscription);
  try {
    res.json({
      status: "success",
      code: 200,
      message: "Subscription has been changed",
      user: {
        email,
        subscription,
      },
    });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  signUp,
  login,
  logout,
  currentUser,
  updateSubs,
};
