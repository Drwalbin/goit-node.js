const service = require("../service/users.js");
const User = require("../service/schemas/user.js");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const jimp = require("jimp");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");

require("dotenv").config();

const secret = process.env.JWT_SECRET;
const emailFrom = process.env.MAIL_FROM;
const emailHost = process.env.MAIL_HOST;
const emailPort = process.env.MAIL_PORT;
const emailUsername = process.env.MAIL_USERNAME;
const emailPassword = process.env.MAIL_PASSWORD;
const appUrl = process.env.APP_URL;

const transporter = nodemailer.createTransport({
  host: emailHost,
  port: emailPort,
  auth: {
    user: emailUsername,
    pass: emailPassword,
  },
});

const sendVerificationEmail = async (email, verificationToken) => {
  const verificationLink = `${appUrl}/api/users/verify/${verificationToken}`;

  const mailOptions = {
    from: emailFrom,
    to: email,
    subject: "Email Verification",
    html: `
      <p>Please click the following link to verify your email:</p>
      <a href="${verificationLink}">${verificationLink}</a>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};

const signUp = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await service.findUserByEmail(email);

  if (user) return res.status(409).json({ message: "Email in use" });

  try {
    const avatar = gravatar.url(email, {
      s: "200",
      r: "pg",
      d: "mm",
    });
    const verificationToken = jwt.sign({ email }, secret, { expiresIn: "1h" });
    const newUser = new User({
      email,
      password,
      avatarURL: avatar,
      verificationToken, // Ustawienie verificationToken przy tworzeniu użytkownika
      verify: false,
    });
    newUser.setPassword(password);
    await newUser.save();

    await sendVerificationEmail(email, verificationToken);

    const { id, subscription } = newUser;
    const payload = {
      id: id,
      email: email,
    };

    const token = jwt.sign(payload, secret, { expiresIn: "3h" });

    await service.addToken(id, token);

    return res.status(201).json({
      message: "Registration successful",
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
        avatarURL: newUser.avatarURL,
      },
      token: token,
    });
  } catch (e) {
    console.error(e);
    next(e);
  }
};

const updateAvatar = async (req, res, next) => {
  const { id, email } = req.user;
  const { file } = req;

  if (!file) {
    return res.status(400).json({ message: "Avatar file is missing" });
  }

  try {
    const image = await jimp.read(file.path);
    await image.cover(250, 250).writeAsync(file.path);

    const uniqueFilename = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    const destinationPath = path.join(
      __dirname,
      "..",
      "public",
      "avatars",
      uniqueFilename
    );

    fs.rename(file.path, destinationPath, async (error) => {
      if (error) {
        console.error(error);
        return next(error);
      }

      const avatarURL = `/avatars/${uniqueFilename}`;

      await service.updateAvatar(id, avatarURL);

      res.status(200).json({ avatarURL });
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

    if (!user.verify)
      return res.status(401).json({ message: "Email is not verified" });

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

const verifyEmail = async (req, res, next) => {
  const { verificationToken } = req.params;

  try {
    const user = await User.findOne({ verificationToken });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verify) {
      return res
        .status(400)
        .json({ message: "Email has already been verified" });
    }

    user.verify = true;
    user.verificationToken = null;
    await user.save();

    res.status(200).json({ message: "Verification successful" });
  } catch (e) {
    next(e);
  }
};

const resendVerificationEmail = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Missing required field email" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verify) {
      return res
        .status(400)
        .json({ message: "Verification has already been passed" });
    }

    const verificationToken = jwt.sign({ email }, secret, { expiresIn: "1h" });
    user.verificationToken = verificationToken;
    await user.save();

    await sendVerificationEmail(email, verificationToken);

    res.status(200).json({ message: "Verification email has been sent" });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  signUp,
  updateAvatar,
  login,
  logout,
  currentUser,
  updateSubs,
  verifyEmail,
  resendVerificationEmail,
};
