import asyncHandler from "../middleware/asyncHandler.js";
import User from "../model/user.js";

export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  delete user.password;

  res.status(200).json(user);
});

export const updateUserProfile = asyncHandler(async (req, res) => {
  const { name, profilePicture } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.name = name;
  user.profilePicture = profilePicture;

  await user.save();

  res.status(200).json(user);
});
