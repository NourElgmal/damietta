/**
 * Reports endpoints (daily, monthly, yearly)
 * - GET /daily
 * - GET /monthly
 * - GET /yearly
 * Admins can query all branches via query param `branch` or omit to get all.
 * Normal users will be limited to their `req.user.branch`.
 */
import express from "express";
import Inventory from "../models/Inventory.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Helper to build match stage for branch + date range
function buildMatch(req, start, end) {
  const match = { createdAt: { $gte: start, $lt: end } };
  if (req.user && !req.user.isAdmin) {
    match.branch = req.user.branch;
  } else if (req.query.branch) {
    match.branch = req.query.branch;
  }
  return match;
}

// Aggregate totals: revenue, loss value, excess value, afterLoss quantity
function aggregateTotals(match) {
  return [
    { $match: match },
    {
      $group: {
        _id: "$branch",
        revenue: { $sum: { $multiply: ["$deliverPrice", "$afterLoss"] } },
        totalLossValue: { $sum: { $multiply: ["$receivePrice", "$loss"] } },
        totalExcessValue: { $sum: { $multiply: ["$deliverPrice", "$excess"] } },
        totalAfterLossQty: { $sum: "$afterLoss" },
        count: { $sum: 1 },
      },
    },
  ];
}

router.get("/daily", authenticate, async (req, res) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const end = new Date(start);
    end.setDate(start.getDate() + 1);
    const match = buildMatch(req, start, end);
    const data = await Inventory.aggregate(aggregateTotals(match));
    return res.json({ period: "daily", start, data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/monthly", authenticate, async (req, res) => {
  try {
    const d = req.query.month ? new Date(req.query.month) : new Date();
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const match = buildMatch(req, start, end);
    const data = await Inventory.aggregate(aggregateTotals(match));
    return res.json({ period: "monthly", start, data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/yearly", authenticate, async (req, res) => {
  try {
    const y = req.query.year
      ? parseInt(req.query.year, 10)
      : new Date().getFullYear();
    const start = new Date(y, 0, 1);
    const end = new Date(y + 1, 0, 1);
    const match = buildMatch(req, start, end);
    const data = await Inventory.aggregate(aggregateTotals(match));
    return res.json({ period: "yearly", start, data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
