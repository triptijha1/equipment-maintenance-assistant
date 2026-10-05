const Issue = require("../models/issue.model");
const Equipment = require("../models/equipment.model");

const { checkThresholds } = require("../services/rule.service");

// ==========================================
// CREATE ISSUE
// ==========================================

const createIssue = async (req, res) => {
  try {
    const {
      equipmentId,
      description,
      operatingEvents = [],
      sensorReadings = []
    } = req.body;

    // -----------------------------
    // Validation
    // -----------------------------

    if (!equipmentId || !description?.trim()) {
      return res.status(400).json({
        message:
          "Equipment and issue description are required"
      });
    }

    // -----------------------------
    // Check equipment
    // -----------------------------

    const equipment = await Equipment.findById(
      equipmentId
    );

    if (!equipment) {
      return res.status(404).json({
        message: "Equipment not found"
      });
    }

    // -----------------------------
    // Deterministic checks
    // -----------------------------

    const thresholdResults =
      checkThresholds(sensorReadings);

    // -----------------------------
    // Save issue
    // -----------------------------

    const issue = await Issue.create({
      equipmentId,
      description: description.trim(),
      operatingEvents,
      sensorReadings,
      thresholdResults,
      status: "REPORTED"
    });

    console.log(
      `[ISSUE_CREATED] ${issue._id}`
    );

    res.status(201).json({
      message: "Issue reported successfully",
      issue
    });
  } catch (error) {
    console.error(
      "[ISSUE_CREATE_ERROR]",
      error
    );

    res.status(500).json({
      message: "Failed to report issue"
    });
  }
};

// ==========================================
// GET MAINTENANCE HISTORY
// ==========================================

const getIssueHistory = async (req, res) => {
  try {
    const { equipmentId } = req.params;

    if (!equipmentId) {
      return res.status(400).json({
        message: "Equipment ID is required"
      });
    }

    const equipment = await Equipment.findById(
      equipmentId
    );

    if (!equipment) {
      return res.status(404).json({
        message: "Equipment not found"
      });
    }

    const history = await Issue.find({
      equipmentId
    })
      .populate(
        "equipmentId",
        "identifier type description"
      )
      .sort({
        createdAt: -1
      })
      .limit(20);

    console.log(
      `[HISTORY_FETCHED] equipment=${equipment.identifier} count=${history.length}`
    );

    res.status(200).json({
      message: "Maintenance history fetched successfully",
      history
    });
  } catch (error) {
    console.error(
      "[HISTORY_FETCH_ERROR]",
      error
    );

    res.status(500).json({
      message: "Failed to fetch maintenance history"
    });
  }
};

module.exports = {
  createIssue,
  getIssueHistory
};