const WorkOrder = require("../models/workOrder.model");
const Issue = require("../models/issue.model");

// ==========================================
// CREATE DRAFT WORK ORDER
// ==========================================

const createWorkOrder = async (req, res) => {
  try {
    const { issueId } = req.params;

    const issue = await Issue.findById(issueId);

    if (!issue) {
      return res.status(404).json({
        message: "Issue not found"
      });
    }

    // AI analysis must exist first
    if (!issue.aiAnalysis) {
      return res.status(400).json({
        message:
          "AI analysis is required before creating a work order"
      });
    }

    // Prevent duplicate work orders
    const existingWorkOrder =
      await WorkOrder.findOne({
        issueId
      });

    if (existingWorkOrder) {
      return res.status(409).json({
        message:
          "Work order already exists for this issue",
        workOrder: existingWorkOrder
      });
    }

    const workOrder =
      await WorkOrder.create({
        issueId,
        equipmentId: issue.equipmentId,

        priority:
          issue.aiAnalysis.priority ||
          "MEDIUM",

        summary:
          issue.aiAnalysis.summary ||
          "Technician inspection required",

        recommendedActions:
          issue.aiAnalysis.inspectionSteps ||
          [],

        status: "DRAFT"
      });

    console.log(
      `[WORK_ORDER_CREATED] ${workOrder._id}`
    );

    res.status(201).json({
      message:
        "Draft work order created successfully",
      workOrder
    });
  } catch (error) {
    console.error(
      "[WORK_ORDER_CREATE_ERROR]",
      error
    );

    res.status(500).json({
      message:
        "Failed to create work order",
      error: error.message
    });
  }
};

// ==========================================
// REVIEW WORK ORDER
// ==========================================

const reviewWorkOrder = async (req, res) => {
  try {
    const { workOrderId } = req.params;

    const {
      priority,
      summary,
      recommendedActions,
      technicianNotes,
      decision
    } = req.body || {};

    // -----------------------------
    // Validate decision
    // -----------------------------

    if (
      !decision ||
      !["APPROVE", "REJECT"].includes(
        decision
      )
    ) {
      return res.status(400).json({
        message:
          "Decision must be APPROVE or REJECT"
      });
    }

    // -----------------------------
    // Find work order
    // -----------------------------

    const workOrder =
      await WorkOrder.findById(workOrderId);

    if (!workOrder) {
      return res.status(404).json({
        message: "Work order not found"
      });
    }

    // -----------------------------
    // Only DRAFT can be reviewed
    // -----------------------------

    if (workOrder.status !== "DRAFT") {
      return res.status(400).json({
        message:
          "Only draft work orders can be reviewed"
      });
    }

    // -----------------------------
    // Apply technician edits
    // -----------------------------

    if (priority) {
      workOrder.priority = priority;
    }

    if (summary?.trim()) {
      workOrder.summary =
        summary.trim();
    }

    if (
      Array.isArray(
        recommendedActions
      )
    ) {
      workOrder.recommendedActions =
        recommendedActions
          .map((action) =>
            String(action).trim()
          )
          .filter(Boolean);
    }

    if (
      technicianNotes !== undefined
    ) {
      workOrder.technicianNotes =
        technicianNotes.trim();
    }

    // -----------------------------
    // APPROVE
    // -----------------------------

    if (decision === "APPROVE") {
      workOrder.status = "APPROVED";
      workOrder.approvedAt =
        new Date();
    }

    // -----------------------------
    // REJECT
    // -----------------------------

    if (decision === "REJECT") {
      workOrder.status = "REJECTED";
    }

    await workOrder.save();

    // -----------------------------
    // Update Issue status
    // -----------------------------

    const issueStatus =
      decision === "APPROVE"
        ? "APPROVED"
        : "REJECTED";

    await Issue.findByIdAndUpdate(
      workOrder.issueId,
      {
        $set: {
          status: issueStatus
        }
      }
    );

    console.log(
      `[WORK_ORDER_REVIEWED] workOrder=${workOrder._id} decision=${decision}`
    );

    console.log(
      `[ISSUE_STATUS_UPDATED] issue=${workOrder.issueId} status=${issueStatus}`
    );

    res.status(200).json({
      message:
        decision === "APPROVE"
          ? "Work order approved successfully"
          : "Work order rejected successfully",

      workOrder
    });
  } catch (error) {
    console.error(
      "[WORK_ORDER_REVIEW_ERROR]",
      error
    );

    res.status(500).json({
      message:
        "Failed to review work order",
      error: error.message
    });
  }
};

module.exports = {
  createWorkOrder,
  reviewWorkOrder
};