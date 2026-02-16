/**
 * User model
 * Fields: name, branch, password (hashed), isAdmin, createdBy, createdAt
 */
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  branch: { type: String, required: true },
  password: { type: String, required: true }, // hashed
  isAdmin: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
