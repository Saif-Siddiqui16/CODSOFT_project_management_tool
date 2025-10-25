import asyncHandler from "../middleware/asyncHandler.js";
import User from "../model/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { registerSchema, loginSchema } from "../validators/auth-validators.js";
import Verification from "../model/verification.js";
import sendMail from "../libs/send-email.js";

const COOKIE_NAME = process.env.COOKIE_NAME || "token";
const COOKIE_SECURE = process.env.COOKIE_SECURE === "true" || false;
const COOKIE_SAME_SITE = process.env.COOKIE_SAME_SITE || "lax";

export const register = asyncHandler(async (req, res) => {
  const parse = registerSchema.safeParse(req.body);
  if (!parse.success) {
    const message = parse.error.errors.map((e) => e.message).join(", ");
    return res.status(400).json({ message });
  }

  const { name, email, password } = parse.data;
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: "Email already in use" });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed });

  const verificationToken = jwt.sign(
    { id: user._id, purpose: "email-verification" },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  await Verification.create({
    userId: user._id,
    token: verificationToken,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  });

  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  const emailBody = `<p>Click <a href="${verificationLink}">here</a> to verify your email</p>`;

  const isEmailSent = await sendMail({
    to: email,
    subject: "Verify your email",
    html: emailBody,
  });
  if (!isEmailSent)
    return res
      .status(500)
      .json({ message: "Failed to send verification email" });

  res
    .status(201)
    .json({ message: "Verification email sent. Please check your inbox." });
});
export const login = asyncHandler(async (req, res) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) {
    const message = parse.error.errors.map((e) => e.message).join(", ");
    return res.status(400).json({ message });
  }

  const { email, password } = parse.data;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  if (!user.isEmailVerified) {
    return res
      .status(400)
      .json({ message: "Email not verified. Please check your email." });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password || "");
  if (!isPasswordValid)
    return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7,
    path: "/",
  });

  user.lastLogin = new Date();
  await user.save();

  res.json({ user: { id: user._id, name: user.name, email: user.email } });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
  res.json({ message: "Logged out" });
});

export const me = asyncHandler(async (req, res) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(200).json({ user: null });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    res.json({ user });
  } catch {
    res.status(200).json({ user: null });
  }
});

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (!payload) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id, purpose } = payload;

    if (purpose !== "email-verification") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const verification = await Verification.findOne({
      userId: id,
      token,
    });
    if (!verification) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const isTokenExpired = verification.expiresAt < new Date();

    if (isTokenExpired) {
      return res.status(401).json({ message: "Token expired" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    user.isEmailVerified = true;
    await user.save();

    await Verification.findByIdAndDelete(verification._id);

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
