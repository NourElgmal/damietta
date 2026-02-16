/**
 * Inventory routes
 * - POST /add: add inventory item (authenticated)
 * - GET /:id: get inventory item by id
 * Only Admin or creator can edit/delete (edit/delete endpoints can be added similarly)
 */
import express from "express";
import Inventory from "../models/Inventory.js";
import { authenticate, allowAdminOrCreator } from "../middleware/auth.js";

const router = express.Router();

// Add inventory item - authenticated users
router.post("/add", authenticate, async (req, res) => {
  try {
    const {
      itemName,
      quantity,
      receivePrice,
      deliverPrice,
      loss = 0,
      excess = 0,
      shift,
      branch,
    } = req.body;
    if (
      !itemName ||
      quantity == null ||
      receivePrice == null ||
      deliverPrice == null ||
      !shift ||
      !branch
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const doc = await Inventory.create({
      itemName,
      quantity,
      receivePrice,
      deliverPrice,
      loss,
      excess,
      shift,
      branch,
      createdBy: req.user._id,
    });

    return res.status(201).json(doc);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Get inventory item
router.get("/:id", authenticate, async (req, res) => {
  try {
    const doc = await Inventory.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ error: "Not found" });
    // Normal users can only see items from their branch
    if (!req.user.isAdmin && doc.branch !== req.user.branch)
      return res.status(403).json({ error: "Forbidden" });
    return res.json(doc);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
