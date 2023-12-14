import { User } from "../models/User.js";
import { HttpError } from "../helpers/HttpError.js";
import { sendEmail } from "../helpers/sendEmail.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import gravatar from "gravatar";
import path from "path";
import Jimp from "jimp";
import { nanoid } from "nanoid";
import { errorMonitor } from "events";

const { JWT_SECRET, BASE_URL } = process.env;
const subsType = ["starter", "pro", "business"];

const avatarsPath = path.resolve("public", "avatars");

const hashPassword = async (password) => {
  return await bcryptjs.hash(password, 10);
};

const signUp = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      throw HttpError(409, "Email in use");
    }
    const avatarURL = gravatar.url(`${req.body.email}`, { s: "250" }, false);
    const verificationToken = nanoid();

    const data = await User.create({
      ...req.body,
      avatarURL,
      verificationToken,
      password: await hashPassword(password),
    });

    const verificationEmail = {
      to: email,
      subject: "Verify email",
      html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${verificationToken}">Click to verify email</a>`,
    };
    await sendEmail(verificationEmail);

    res.status(201).json({ user: { email, password } });
  } catch (error) {
    next(error);
  }
};
const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw HttpError(401, "Email or password is wrong");
    }
    if (!user.verify) {
      throw HttpError(403, "user not verified");
    }
    const correctPassword = bcryptjs.compare(password, user.password);
    if (!correctPassword) {
      throw HttpError(401, "Email or password is wrong");
    }
    const payload = {
      id: user._id,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });
    await User.findByIdAndUpdate(user._id, { token });
    res.json({
      token,
      user: { email: email, subscription: user.subscription },
    });
  } catch (error) {
    next(error);
  }
};

const getCurrent = async (req, res, next) => {
  const { email, subscription } = req.user;
  res.json({ email, subscription });
};

const logOut = async (req, res, next) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });
  res.status(204).json();
};

const subscriptionUpdate = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const { subscription: newSubscription } = req.body;

    if (!subsType.find((subs) => subs === newSubscription)) {
      throw HttpError(400, "Invalid subscription value");
    }

    await User.findByIdAndUpdate(_id, { subscription: newSubscription });
    res
      .status(200)
      .json({ message: `Subscription updated to ${newSubscription}` });
  } catch (error) {
    next(error);
  }
};

const avatarUpdate = async (req, res, next) => {
  try {
    const { _id } = req.user;

    const newPath = path.join(avatarsPath, `${_id}_${req.file.filename}`);
    await Jimp.read(req.file.path).then((img) => {
      return img.resize(250, 250).write(newPath);
    });

    const newAvatarURL = path.join(
      "public",
      "avatars",
      `${_id}_${req.file.filename}`
    );
    await User.findOneAndUpdate({ _id, avatarURL: newAvatarURL });

    res.status(200).json({ avatarURL: newAvatarURL });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });
    if (!user) {
      throw HttpError(401, "Email not found");
    }
    if (user.verify) {
      throw HttpError(404, "User not found");
    }
    await User.findByIdAndUpdate(user._id, { verify: true, verificationToken });
    res.status(200).json({ message: "Verification successful" });
  } catch (error) {
    next(error);
  }
};

const resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw HttpError(404, "User not found");
    }
    if (user.verify) {
      throw HttpError(400, "Verification has already been passed");
    }
    const verificationEmail = {
      to: email,
      subject: "Verify email",
      html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${verificationToken}">Click to verify email</a>`,
    };
    await sendEmail(verificationEmail);
    res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    next(error);
  }
};

export default {
  signUp,
  signIn,
  getCurrent,
  logOut,
  subscriptionUpdate,
  avatarUpdate,
  verifyEmail,
  resendVerificationEmail,
};
