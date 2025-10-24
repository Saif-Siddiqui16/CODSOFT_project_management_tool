import express from "express";
import {
  register,
  login,
  logout,
  me,
  verifyEmail,
} from "../controllers/auth-controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", me);
router.post("/verify-email", verifyEmail);

export default router;
