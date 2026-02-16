/**
 * Inventory model
 * Fields: itemName, quantity, receivePrice, deliverPrice, loss, excess, afterLoss, shift, branch, createdBy, createdAt
 */
import mongoose from "mongoose";

const InventorySchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true },
  receivePrice: { type: Number, required: true },
  deliverPrice: { type: Number, required: true },
  loss: { type: Number, default: 0 },
  excess: { type: Number, default: 0 },
  afterLoss: { type: Number },
  shift: { type: String, enum: ["morning", "evening"], required: true },
  branch: { type: String, required: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

// Pre-save: calculate afterLoss if not provided
InventorySchema.pre("save", function (next) {
  if (this.afterLoss == null) {
    // afterLoss = quantity - loss + excess
    this.afterLoss =
      (this.quantity || 0) - (this.loss || 0) + (this.excess || 0);
  }
  next();
});

export default mongoose.models.Inventory ||
  mongoose.model("Inventory", InventorySchema);
