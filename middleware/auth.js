/**
 * JWT authentication and authorization middleware
 */
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Verify JWT and attach user to req.user
export async function authenticate(req, res, next) {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer "))
    return res
      .status(401)
      .json({ error: "Missing or invalid Authorization header" });
  const token = auth.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).lean();
    if (!user) return res.status(401).json({ error: "User not found" });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// Allow only admin users
export function requireAdmin(req, res, next) {
  if (!req.user || !req.user.isAdmin)
    return res.status(403).json({ error: "Admin only" });
  next();
}

// Allow admin or resource creator
export function allowAdminOrCreator(getOwnerId) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    if (req.user.isAdmin) return next();
    const ownerId = getOwnerId(req);
    if (ownerId && ownerId.toString() === req.user._id.toString())
      return next();
    return res.status(403).json({ error: "Forbidden" });
  };
}
