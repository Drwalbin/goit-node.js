const path = require("path");
const fs = require("fs/promises");

const service = require("../service/users.js");
const User = require("../service/schemas/user.js");
const { AVATAR_DIRECTORY } = require("../config/upload.js");

const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const Jimp = require("jimp");

require("dotenv").config();
const secret = process.env.JWT_SECRET;

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

const sendVerificationEmail = (email, verificationToken) => {
  const mailOptions = {
    from: process.env.MAIL_FROM,
    to: email,
    subject: "Weryfikacja adresu email",
    html: `<p>Kliknij poniższy link, aby zweryfikować swój adres email:</p>
           <a href="${process.env.APP_URL}/users/verify/${verificationToken}">${process.env.APP_URL}/users/verify/${verificationToken}</a>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Błąd wysyłania emaila:", error);
    } else {
      console.log("Email wysłany:", info.response);
    }
  });
};

const signUp = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await service.findUserByEmail(email);
    if (user) {
      return res.status(409).json({ message: "Email in use" });
    }

    const avatarURL = gravatar.url(email, {
      s: "200",
      r: "pg",
      d: "mm",
    });

    const newUser = new User({
      email,
      avatarURL,
      verificationToken: "generated_token",
    });
    newUser.setPassword(password);
    await newUser.save();

    sendVerificationEmail(newUser.email, newUser.verificationToken);

    return res.status(201).json({
      message: "Registration successful",
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
        avatarURL,
      },
    });
  } catch (e) {
    console.error("Registration error:", e);
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

    user.verificationToken = null;
    user.verify = true;
    await user.save();

    return res.status(200).json({ message: "Verification successful" });
  } catch (e) {
    console.error("Email verification error:", e);
    return res
      .status(500)
      .json({ message: "An error occurred during email verification" });
  }
};

const resendVerificationEmail = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Missing required field: email" });
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

    const newVerificationToken = "generated_new_token";

    user.verificationToken = newVerificationToken;
    await user.save();

    sendVerificationEmail(user.email, newVerificationToken);

    return res.status(200).json({ message: "Verification email sent" });
  } catch (e) {
    console.error("Error sending verification email:", e);
    return res
      .status(500)
      .json({
        message: "An error occurred while sending the verification email",
      });
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

const avatarUpdate = async (req, res, next) => {
  const { path: temporaryName, filename } = req.file;
  const avatarURL = path.join(AVATAR_DIRECTORY, filename);

  Jimp.read(temporaryName)
    .then((avatar) => {
      return avatar
        .resize(250, 250) // resize
        .write(avatarURL); // save
    })
    .catch((err) => {
      console.error(err);
    });

  try {
    await fs.rename(temporaryName, avatarURL);
    await service.updateAvatar(req.user.id, avatarURL);
  } catch (e) {
    await fs.unlink(temporaryName);
    next(e);
  }
  res.status(200).json({ avatarURL });
};

module.exports = {
  signUp,
  verifyEmail,
  resendVerificationEmail,
  login,
  logout,
  currentUser,
  updateSubs,
  avatarUpdate,
};
