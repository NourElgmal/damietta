/**
 * Users routes
 * - POST /register: create user (first user becomes admin automatically)
 * - POST /login: returns JWT
 * - PUT /:id/promote: promote to admin (Admin only)
 * - GET /:id: get user (Admin or creator)
 * - DELETE /:id: delete user (Admin or creator)
 */
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import {
  authenticate,
  requireAdmin,
  allowAdminOrCreator,
} from "../middleware/auth.js";

const router = express.Router();

// Register a new user. If no users exist, the first becomes admin.
router.post("/register", async (req, res) => {
  try {
    const { name, branch, password } = req.body;
    if (!name || !branch || !password)
      return res
        .status(400)
        .json({ error: "name, branch and password are required" });

    const hashed = await bcrypt.hash(password, 10);
    const userCount = await User.countDocuments();
    const isAdmin = userCount === 0; // first user becomes admin

    const user = await User.create({ name, branch, password: hashed, isAdmin });
    return res
      .status(201)
      .json({
        id: user._id,
        name: user.name,
        branch: user.branch,
        isAdmin: user.isAdmin,
      });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Login: return JWT
router.post("/login", async (req, res) => {
  try {
    const { name, password } = req.body;
    if (!name || !password)
      return res.status(400).json({ error: "name and password required" });
    const user = await User.findOne({ name });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        branch: user.branch,
        isAdmin: user.isAdmin,
      },
    });
        if (!process.env.JWT_SECRET) {
          console.error('JWT_SECRET is not set');
          return res.status(500).json({ error: 'Server configuration error: JWT_SECRET not set' });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        return res.json({ token, user: { id: user._id, name: user.name, branch: user.branch, isAdmin: user.isAdmin } });
    return res.status(500).json({ error: "Server error" });
  }
        const message = process.env.NODE_ENV === 'production' ? 'Server error' : err.message || 'Server error';
        return res.status(500).json({ error: 'Server error', details: message });

// Promote user to admin (Admin only)
router.put("/:id/promote", authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(
      id,
      { isAdmin: true },
      { new: true },
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json({ id: user._id, isAdmin: user.isAdmin });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Get user by id (Admin or creator)
router.get(
  "/:id",
  authenticate,
  allowAdminOrCreator((req) => req.params.id),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id)
        .select("-password")
        .lean();
      if (!user) return res.status(404).json({ error: "User not found" });
      return res.json(user);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Server error" });
    }
  },
);

// Delete user (Admin or creator)
router.delete(
  "/:id",
  authenticate,
  allowAdminOrCreator((req) => req.params.id),
  async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found" });
      return res.json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Server error" });
    }
  },
);

export default router;
