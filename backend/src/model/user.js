import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String, required: true, trim: true },
    password: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    profilePicture: String,
    lastLogin: Date,
  },
  { timestamps: true }
);
const User = mongoose.model("User", UserSchema);

export default User;
