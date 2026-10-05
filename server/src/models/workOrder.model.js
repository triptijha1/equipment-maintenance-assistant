const mongoose = require("mongoose");

const workOrderSchema = new mongoose.Schema(
  {
    issueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      required: true
    },

    equipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      required: true
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      required: true
    },

    summary: {
      type: String,
      required: true
    },

    recommendedActions: [
      {
        type: String
      }
    ],

    status: {
      type: String,
      enum: ["DRAFT", "APPROVED", "REJECTED"],
      default: "DRAFT"
    },

    technicianNotes: {
      type: String
    },

    approvedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

const WorkOrder = mongoose.model("WorkOrder", workOrderSchema);

module.exports = WorkOrder;